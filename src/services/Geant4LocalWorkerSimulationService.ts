import Geant4Worker from '../Geant4Worker/Geant4Worker';
import { Estimator, Page1D, Page2D } from '../JsRoot/GraphData';
import { PythonConverterContext } from '../PythonConverter/PythonConverterService';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import {
	isEditorJson,
	JobInputs,
	JobLogs,
	JobResults,
	OrderBy,
	OrderType,
	RequestGetJobInputs,
	RequestGetJobLogs,
	RequestGetJobResult,
	RequestGetJobResults,
	RequestGetJobStatus,
	RequestGetPageStatus,
	RequestPostJob,
	SimulatorType
} from '../types/RequestTypes';
import {
	EstimatorItem,
	Geant4InputFilesNames,
	InputFilesRecord,
	JobStatusData,
	ResponseGetPageContents,
	ResponsePostJob,
	SimulationInfo,
	StatusState
} from '../types/ResponseTypes';
import { FullSimulationData, SimulationService } from '../types/SimulationService';
import { Geant4DatasetsType } from '../WrapperApp/components/Simulation/Geant4DatasetDownload';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';
import {
	distributePrimaries,
	mergeGeant4ResultFiles,
	prepareWorkerMacro
} from './Geant4MacroHelpers';
import { Geant4ResultsFileParser } from './Geant4ResultsFileParser';

type JobId = string;

interface JobMetadata {
	title: string;
	inputType: SimulationSourceType;
}

/**
 * Maximum number of concurrent Geant4 WebAssembly worker instances allowed in browser memory.
 * Geant4 Wasm allocates significant memory per instance (1-2GB virtual heap).
 * Limiting concurrency prevents 'RangeError: Array buffer allocation failed'.
 */
export const MAX_LOCAL_GEANT4_WORKERS = 3;

export default class Geant4LocalWorkerSimulationService implements SimulationService {
	convertJSON: PythonConverterContext['convertJSON'];
	workers: Record<JobId, Geant4Worker[]>;
	inputFiles: Record<JobId, Record<string, string>>;
	estimators: Record<JobId, EstimatorItem[]>;
	resultsForEstimators: Record<JobId, Record<string, Estimator>>;
	jobsEditorJson: Record<JobId, EditorJson>;
	jobsMetadata: Record<JobId, JobMetadata>;
	numPrimaries: Record<JobId, number>;
	primariesPerWorker: Record<JobId, number[]>;

	responseCache: Record<
		'jobInputs' | 'jobStatusData' | 'jobResults' | 'estimatorsPages' | 'pageStatus',
		Record<JobId, any>
	>;

	constructor(convertJSON: PythonConverterContext['convertJSON']) {
		this.convertJSON = convertJSON;
		this.workers = {};
		this.inputFiles = {};
		this.estimators = {};
		this.resultsForEstimators = {};
		this.jobsEditorJson = {};
		this.jobsMetadata = {};
		this.responseCache = {
			jobInputs: {},
			jobStatusData: {},
			jobResults: {},
			estimatorsPages: {},
			pageStatus: {}
		};
		this.numPrimaries = {};
		this.primariesPerWorker = {};
	}

	determineWorkerCount(requestedTasks?: number): number {
		const availableCores =
			typeof navigator !== 'undefined' && navigator.hardwareConcurrency
				? navigator.hardwareConcurrency
				: 2;
		const defaultWorkers = Math.max(1, Math.min(availableCores - 1, MAX_LOCAL_GEANT4_WORKERS));

		if (requestedTasks && requestedTasks > 0) {
			return Math.min(requestedTasks, MAX_LOCAL_GEANT4_WORKERS);
		}

		return defaultWorkers;
	}

	getJobCombinedState(jobId: string): StatusState {
		const workers = this.workers[jobId];

		if (!workers || workers.length === 0) {
			return StatusState.PENDING;
		}

		if (workers.some(w => w.getState() === StatusState.FAILED)) {
			return StatusState.FAILED;
		}

		if (workers.some(w => w.getState() === StatusState.CANCELED)) {
			return StatusState.CANCELED;
		}

		if (workers.some(w => w.getState() === StatusState.RUNNING)) {
			return StatusState.RUNNING;
		}

		if (workers.every(w => w.getState() === StatusState.COMPLETED)) {
			return StatusState.COMPLETED;
		}

		return StatusState.PENDING;
	}

	areAllWorkersCompleted(jobId: string): boolean {
		const workers = this.workers[jobId];

		return Boolean(
			workers &&
				workers.length > 0 &&
				workers.every(w => w.getState() === StatusState.COMPLETED)
		);
	}

	getJobStartTime(jobId: string): string {
		const workers = this.workers[jobId];

		if (!workers || workers.length === 0) return '';

		const startTimes = workers
			.map(w => w.getStartTime())
			.filter((t): t is string => typeof t === 'string' && t.length > 0)
			.sort();

		return startTimes.length > 0 ? startTimes[0] : '';
	}

	getJobEndTime(jobId: string): string | undefined {
		const workers = this.workers[jobId];

		if (!workers || workers.length === 0) return undefined;
		if (!this.areAllWorkersCompleted(jobId)) return undefined;

		const endTimes = workers
			.map(w => w.getEndTime())
			.filter((t): t is string => typeof t === 'string' && t.length > 0)
			.sort();

		return endTimes.length > 0 ? endTimes[endTimes.length - 1] : undefined;
	}

	async helloWorld(signal?: AbortSignal): Promise<boolean> {
		return Promise.resolve(true);
	}

	async postJob(...args: RequestPostJob): Promise<ResponsePostJob> {
		let [
			simData,
			inputType,
			_runType,
			_ntasks,
			_simType,
			title,
			_batchOptions,
			geant4DatasetType,
			_signal
		] = args;

		if (title === undefined && isEditorJson(simData)) {
			title = simData.project.title;
		}

		const jobId = crypto.randomUUID();

		if (inputType === 'editor') {
			this.jobsEditorJson[jobId] = simData as EditorJson;
			simData = Object.fromEntries(
				(await this.convertJSON(simData as EditorJson, SimulatorType.GEANT4)).entries()
			);
		}

		const rawGdml = (simData as Record<string, string>)['geometry.gdml'];
		const rawMacro = (simData as Record<string, string>)['run.mac'];

		this.jobsMetadata[jobId] = { title: title ?? '', inputType };

		this.inputFiles[jobId] = {
			'geometry.gdml': rawGdml,
			'run.mac': rawMacro
		};

		// Extract total requested primaries from the macro
		const rawNumPrimaries = rawMacro
			.split('\n')
			.find(l => l.startsWith('/run/beamOn'))
			?.split(' ')[1];
		const totalPrimaries = rawNumPrimaries ? parseInt(rawNumPrimaries, 10) : 0;

		const workerCount = this.determineWorkerCount(_ntasks);
		const primariesDistribution = distributePrimaries(totalPrimaries, workerCount);

		// Filter out workers that got 0 primaries (if primaries < workerCount)
		const activeDistribution = primariesDistribution.filter(p => p > 0);
		const finalDistribution =
			activeDistribution.length > 0 ? activeDistribution : [totalPrimaries];

		const workers = finalDistribution.map(() => new Geant4Worker());
		this.workers[jobId] = workers;
		this.numPrimaries[jobId] = totalPrimaries;
		this.primariesPerWorker[jobId] = finalDistribution;

		workers.forEach((worker, idx) => {
			const workerPrimaries = finalDistribution[idx];
			const workerMacro = prepareWorkerMacro(rawMacro, workerPrimaries);

			worker.init().then(async () => {
				if (geant4DatasetType && geant4DatasetType === Geant4DatasetsType.FULL) {
					await worker.loadDeps();
				} else {
					await worker.loadDepsLazy();
				}

				await worker.includeFile('geometry.gdml', rawGdml);
				await worker.includeFile('run.mac', workerMacro);

				worker.start();
			});
		});

		return { jobId, message: '' };
	}

	async getJobInputs(...args: RequestGetJobInputs): Promise<JobInputs | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;

		if (this.responseCache.jobInputs.hasOwnProperty(info.jobId)) {
			return this.responseCache.jobInputs[info.jobId];
		}

		if (!this.inputFiles.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		this.responseCache.jobInputs[info.jobId] = {
			jobId: info.jobId,
			input: {
				inputType: this.jobsMetadata[info.jobId]?.inputType ?? 'editor',
				inputFiles: this.inputFiles[info.jobId] as InputFilesRecord<
					Geant4InputFilesNames,
					''
				>,
				...{ inputJson: this.jobsEditorJson[info.jobId] } // add iff exists
			},
			message: ''
		} as JobInputs;

		if (cache) beforeCacheWrite?.(info.jobId, this.responseCache.jobInputs[info.jobId]);

		return this.responseCache.jobInputs[info.jobId];
	}

	private getJobTasksStatus(jobId: string) {
		const workers = this.workers[jobId] || [];
		const requestedPerWorker = this.primariesPerWorker[jobId] || [];
		const totalPrimaries = this.numPrimaries[jobId] || 1;

		return workers.map((worker, idx) => ({
			requestedPrimaries:
				requestedPerWorker[idx] ?? Math.floor(totalPrimaries / (workers.length || 1)),
			simulatedPrimaries: worker.getSimulatedPrimaries()
		}));
	}

	async getJobStatus(...args: RequestGetJobStatus): Promise<JobStatusData | undefined> {
		const [info, cache = true, beforeCacheWrite, signal] = args;
		const { jobId } = info;

		if (this.responseCache.jobStatusData.hasOwnProperty(info.jobId)) {
			return this.responseCache.jobStatusData[info.jobId];
		}

		if (!this.workers.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		this.responseCache.jobStatusData[info.jobId] = {
			jobId,
			title: this.jobsMetadata[jobId]?.title ?? '',
			startTime: this.getJobStartTime(jobId).toString(),
			endTime: this.getJobEndTime(jobId)?.toString(),
			metadata: {
				inputType: this.jobsMetadata[jobId]?.inputType ?? 'editor',
				simType: 'Geant4',
				server: '',
				platform: 'DIRECT'
			},
			jobState: this.getJobCombinedState(jobId),
			jobTasksStatus: this.getJobTasksStatus(jobId)
		} as JobStatusData;

		if (cache) beforeCacheWrite?.(jobId, this.responseCache.jobStatusData[info.jobId]);

		return this.responseCache.jobStatusData[info.jobId];
	}

	async getJobLogs(...args: RequestGetJobLogs): Promise<JobLogs | undefined> {
		const [info, signal, cache, beforeCacheWrite] = args;
		const { jobId } = info;

		if (!this.workers.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		return {
			jobId,
			logfiles: {},
			message: ''
		};
	}

	async hydrateResults(jobId: string) {
		// This method may experience race conditions with accessing and terminating the worker
		// See below for the try catch block that handles it
		if (
			!this.workers.hasOwnProperty(jobId) ||
			!this.areAllWorkersCompleted(jobId) ||
			this.resultsForEstimators.hasOwnProperty(jobId)
		) {
			return;
		}

		let fileNames: string[] = [];
		this.inputFiles[jobId]['run.mac'].split('\n').forEach(line => {
			if (line.startsWith('/score/dumpQuantityToFile')) {
				fileNames.push(line.split(' ').at(-1)!);
			}
		});

		let fileContents: string[];

		try {
			const workers = this.workers[jobId];

			if (!workers || workers.length === 0) {
				return;
			}

			// For each output file requested in run.mac, fetch the partial file from all workers and merge them
			fileContents = await Promise.all(
				fileNames.map(async fileName => {
					const contentsFromWorkers = await Promise.all(
						workers.map(w => w.fetchResultsFile(fileName))
					);

					return mergeGeant4ResultFiles(contentsFromWorkers);
				})
			);
		} catch {
			// Worker failed
			// could be because other hydration call finished, and it got destroyed
			// - then the hydration has already completed, and we can gracefully exit
			// or, it could have failed unexpectedly - then we log the fact to the console
			if (!this.resultsForEstimators.hasOwnProperty(jobId)) {
				console.warn(`Results hydration failed for ${jobId}`);
			}

			return;
		}

		const parser = new Geant4ResultsFileParser(
			this.numPrimaries[jobId] || 1,
			this.inputFiles[jobId]['run.mac'],
			this.jobsEditorJson[jobId]
		);

		const parsedContents = fileContents
			.map(file => (file ? parser.parseResultFile(file) : undefined))
			.filter(v => !!v);

		const estimatorsNames = new Set(parsedContents.map(c => c?.metadata.meshName))
			.values()
			.toArray();

		const estimatorsMetadata: { [k: string]: EstimatorItem } = Object.fromEntries(
			estimatorsNames.map(name => [name, { name, pagesMetadata: [] }])
		);

		const resultsPerEstimator: { [k: string]: Estimator } = Object.fromEntries(
			estimatorsNames.map(name => [name, { name, pages: [] }])
		);

		for (const content of parsedContents) {
			estimatorsMetadata[content.metadata.meshName].pagesMetadata.push({
				pageDimension: content.metadata.dimensions,
				pageName: content.metadata.scorerName,
				pageNumber: estimatorsMetadata[content?.metadata.meshName].pagesMetadata.length
			});

			resultsPerEstimator[content.metadata.meshName].pages.push(content.results);
		}

		this.estimators[jobId] = Object.values(estimatorsMetadata);
		this.resultsForEstimators[jobId] = resultsPerEstimator;

		this.workers[jobId].forEach(w => w.markSafeForTermination());
	}

	async getJobResults(...args: RequestGetJobResults): Promise<JobResults | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;
		const { jobId } = info;

		if (this.responseCache.jobResults.hasOwnProperty(jobId)) {
			return this.responseCache.jobResults[jobId];
		}

		if (!this.workers.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		let estimators: Estimator[] = [];

		if (this.workers.hasOwnProperty(jobId) && this.areAllWorkersCompleted(jobId)) {
			if (!this.estimators.hasOwnProperty(jobId)) {
				await this.hydrateResults(jobId);
			}

			estimators = [...Object.values(this.resultsForEstimators[jobId])];
		}

		const results = {
			jobId,
			estimators,
			message: ''
		};

		if (estimators.length > 0) {
			this.responseCache.jobResults[jobId] = results;

			if (cache) beforeCacheWrite?.(jobId, results);
		}

		return results;
	}

	async getEstimatorsPages(...args: RequestGetJobResult): Promise<JobResults | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;
		const { jobId, estimatorName, pageNumbers } = info;

		if (this.responseCache.estimatorsPages.hasOwnProperty(jobId)) {
			return this.responseCache.estimatorsPages[jobId];
		}

		if (!this.workers.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		let estimators: Estimator[] = [];

		if (this.workers.hasOwnProperty(jobId) && this.areAllWorkersCompleted(jobId)) {
			if (!this.estimators.hasOwnProperty(jobId)) {
				await this.hydrateResults(jobId);
			}

			estimators = [...Object.values(this.resultsForEstimators[jobId])];
		}

		const results = {
			jobId,
			estimators,
			message: ''
		};

		if (estimators.length > 0) {
			this.responseCache.estimatorsPages[jobId] = results;

			if (cache) beforeCacheWrite?.(jobId, results);
		}

		return results;
	}

	async getFullSimulationData(
		jobStatus: JobStatusData,
		signal: AbortSignal,
		cache: boolean,
		givenEstimatorName: string
	): Promise<FullSimulationData | undefined> {
		const { jobId } = jobStatus;

		if (!this.workers.hasOwnProperty(jobId)) {
			return undefined;
		}

		let estimators: Estimator[] = [];

		if (this.workers.hasOwnProperty(jobId) && this.areAllWorkersCompleted(jobId)) {
			if (!this.estimators.hasOwnProperty(jobId)) {
				await this.hydrateResults(jobId);
			}

			estimators = [...Object.values(this.resultsForEstimators[jobId])];
		}

		return {
			jobId,
			title: this.jobsMetadata[jobId]?.title ?? '',
			startTime: this.getJobStartTime(jobId).toString(),
			endTime: this.getJobEndTime(jobId)?.toString(),
			metadata: {
				inputType: this.jobsMetadata[jobId]?.inputType ?? 'editor',
				simType: 'Geant4',
				server: '',
				platform: 'DIRECT'
			},
			jobTasksStatus: this.getJobTasksStatus(jobId),
			input: {
				inputType: this.jobsMetadata[jobId]?.inputType ?? 'editor',
				inputFiles: this.inputFiles[jobId] as InputFilesRecord<Geant4InputFilesNames, ''>,
				...(this.jobsEditorJson[jobId] && { inputJson: this.jobsEditorJson[jobId] }) // add iff exists
			},
			estimators
		};
	}

	private compareString(s1: string, s2: string, descending = true): number {
		if (descending) {
			return s1 <= s2 ? (s1 === s2 ? 0 : -1) : 1;
		}

		return s1 >= s2 ? (s1 === s2 ? 0 : -1) : 1;
	}

	private getSortedWorkersEntries(
		orderType: OrderType,
		orderBy: OrderBy
	): [string, Geant4Worker[]][] {
		const getTimeFn =
			orderBy === 'start_time'
				? (jobId: string) => this.getJobStartTime(jobId).toString()
				: (jobId: string) => this.getJobEndTime(jobId)?.toString() ?? '';

		return Object.entries(this.workers).sort((w1, w2) => {
			if (w1[1] === undefined && w2[1] === undefined) {
				return this.compareString(w1[0], w2[0], orderType === 'descend');
			}

			return this.compareString(getTimeFn(w1[0]), getTimeFn(w2[0]), orderType === 'descend');
		});
	}

	async getPageContents(
		pageIdx: number,
		pageSize: number,
		orderType: OrderType,
		orderBy: OrderBy,
		jobState: StatusState[],
		signal?: AbortSignal | undefined
	): Promise<ResponseGetPageContents> {
		const workersEntries = this.getSortedWorkersEntries(orderType, orderBy);
		const allowedStates = new Set(jobState);
		const filteredWorkersEntries = workersEntries.filter(([jobId]) => {
			return allowedStates.has(this.getJobCombinedState(jobId));
		});

		const paginatedWorkersEntries = filteredWorkersEntries.slice(
			pageSize * (pageIdx - 1),
			pageSize * pageIdx
		);

		return {
			pageCount: Math.ceil(filteredWorkersEntries.length / pageSize),
			simulationsCount: filteredWorkersEntries.length,
			simulations: paginatedWorkersEntries.map(([jobId]) => ({
				jobId,
				title: this.jobsMetadata[jobId]?.title ?? '',
				startTime: this.getJobStartTime(jobId).toString(),
				endTime: this.getJobEndTime(jobId)?.toString(),
				metadata: {
					inputType: this.jobsMetadata[jobId]?.inputType ?? 'editor',
					simType: 'Geant4',
					server: '',
					platform: 'DIRECT'
				},
				jobState: this.getJobCombinedState(jobId),
				jobTasksStatus: this.getJobTasksStatus(jobId)
			})),
			message: ''
		};
	}

	async getPageStatus(...args: RequestGetPageStatus): Promise<JobStatusData[] | undefined> {
		const [infoList, cache = true, beforeCacheWrite, signal] = args;

		// IMPORTANT: infoList comes with some order of items that should be kept unchanged
		const workersEntries: [string, Geant4Worker[]][] = infoList
			.map(info =>
				this.workers.hasOwnProperty(info.jobId)
					? ([info.jobId, this.workers[info.jobId]] as [string, Geant4Worker[]])
					: undefined
			)
			.filter((entry): entry is [string, Geant4Worker[]] => Boolean(entry));

		return workersEntries.map(([jobId]) => {
			if (this.responseCache.pageStatus.hasOwnProperty(jobId)) {
				return this.responseCache.pageStatus[jobId];
			}

			const state = this.getJobCombinedState(jobId);
			const response = {
				jobId,
				title: this.jobsMetadata[jobId]?.title ?? '',
				startTime: this.getJobStartTime(jobId).toString(),
				endTime: this.getJobEndTime(jobId)?.toString(),
				metadata: {
					inputType: this.jobsMetadata[jobId]?.inputType ?? 'editor',
					simType: 'Geant4',
					server: '',
					platform: 'DIRECT'
				},
				jobState: state,
				jobTasksStatus: this.getJobTasksStatus(jobId)
			} as JobStatusData;

			if (state === StatusState.COMPLETED) {
				this.responseCache.pageStatus[jobId] = response;

				if (cache) beforeCacheWrite?.(jobId, response);
			}

			return response;
		});
	}

	cancelJob(info: SimulationInfo, signal?: AbortSignal | undefined): Promise<void> {
		const { jobId } = info;

		if (this.workers.hasOwnProperty(jobId)) {
			this.workers[jobId]?.forEach(w => w.cancel());
		}

		return Promise.resolve();
	}
}
