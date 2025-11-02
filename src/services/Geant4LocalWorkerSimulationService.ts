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
import { Geant4ResultsFileParser } from './Geant4ResultsFileParser';

type JobId = string;

interface JobMetadata {
	title: string;
	inputType: SimulationSourceType;
}

export default class Geant4LocalWorkerSimulationService implements SimulationService {
	convertJSON: PythonConverterContext['convertJSON'];
	workers: Record<JobId, Geant4Worker>;
	inputFiles: Record<JobId, Record<string, string>>;
	estimators: Record<JobId, EstimatorItem[]>;
	resultsForEstimators: Record<JobId, Record<string, Estimator>>;
	jobsEditorJson: Record<JobId, EditorJson>;
	jobsMetadata: Record<JobId, JobMetadata>;
	numPrimaries: number;

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
		this.numPrimaries = 1; // default value that works as divisor
	}

	async helloWorld(signal?: AbortSignal): Promise<boolean> {
		return Promise.resolve(true);
	}

	async postJob(...args: RequestPostJob): Promise<ResponsePostJob> {
		let [
			simData,
			inputType,
			runType,
			ntasks,
			simType,
			title,
			batchOptions,
			geant4DatasetType,
			signal
		] = args;
		console.log(geant4DatasetType);

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

		const worker = new Geant4Worker();
		this.workers[jobId] = worker;
		this.jobsMetadata[jobId] = { title: title ?? '', inputType };

		this.inputFiles[jobId] = {
			// @ts-ignore
			'geometry.gdml': simData['geometry.gdml'],
			// @ts-ignore
			'run.mac': simData['run.mac']
		};

		// To find out number of primaries for both editor JSON and input files
		// we search the /run/beamOn command in macro file, which is either passed directly,
		// or generated from the editor JSON
		const rawNumPrimaries = this.inputFiles[jobId]['run.mac']
			.split('\n')
			.find(l => l.startsWith('/run/beamOn'))
			?.split(' ')[1];
		this.numPrimaries = rawNumPrimaries ? parseInt(rawNumPrimaries) : 0;

		worker.init().then(async () => {
			if (geant4DatasetType && geant4DatasetType === Geant4DatasetsType.DOWNLOADED) {
				await worker.loadDeps();
			} else {
				await worker.loadDepsLazy();
			}

			// @ts-ignore
			await worker.includeFile('geometry.gdml', simData['geometry.gdml']);
			// @ts-ignore
			await worker.includeFile('run.mac', simData['run.mac']);

			worker.start();
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
				inputType: this.jobsMetadata[info.jobId].inputType,
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
		return [
			{
				requestedPrimaries: this.numPrimaries,
				simulatedPrimaries: this.workers[jobId].getSimulatedPrimaries()
			}
		];
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
			title: this.jobsMetadata[jobId]?.title,
			startTime: this.workers[jobId].getStartTime().toString(),
			endTime: this.workers[jobId].getEndTime()?.toString(),
			metadata: {
				inputType: this.jobsMetadata[jobId].inputType,
				simType: 'Geant4',
				server: '',
				platform: 'DIRECT'
			},
			jobState: this.workers[jobId].getState(),
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
		if (
			!this.workers.hasOwnProperty(jobId) ||
			this.workers[jobId].getState() !== StatusState.COMPLETED
		) {
			return;
		}

		let fileNames: string[] = [];
		this.inputFiles[jobId]['run.mac'].split('\n').forEach(line => {
			if (line.startsWith('/score/dumpQuantityToFile')) {
				fileNames.push(line.split(' ').at(-1)!);
			}
		});

		const fileContents = await Promise.all(
			fileNames.map(fileName => this.workers[jobId].fetchResultsFile(fileName))
		);

		// TODO: find a way to terminate & destroy the worker after fetching the files to free up memory
		// TODO: keeping in mind, that this method can be called multiple times, simultaneously

		const parser = new Geant4ResultsFileParser(this.numPrimaries);

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

		if (
			this.workers.hasOwnProperty(jobId) &&
			this.workers[jobId].getState() === StatusState.COMPLETED
		) {
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

		if (
			this.workers.hasOwnProperty(jobId) &&
			this.workers[jobId].getState() === StatusState.COMPLETED
		) {
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

		if (
			this.workers.hasOwnProperty(jobId) &&
			this.workers[jobId].getState() === StatusState.COMPLETED
		) {
			if (!this.estimators.hasOwnProperty(jobId)) {
				await this.hydrateResults(jobId);
			}

			estimators = [...Object.values(this.resultsForEstimators[jobId])];
		}

		return {
			jobId,
			title: this.jobsMetadata[jobId]?.title,
			startTime: this.workers[jobId].getStartTime().toString(),
			endTime: this.workers[jobId].getEndTime()?.toString(),
			metadata: {
				inputType: this.jobsMetadata[jobId].inputType,
				simType: 'Geant4',
				server: '',
				platform: 'DIRECT'
			},
			jobTasksStatus: this.getJobTasksStatus(jobId),
			input: {
				inputType: this.jobsMetadata[jobId].inputType,
				inputFiles: this.inputFiles[jobId] as InputFilesRecord<Geant4InputFilesNames, ''>,
				...{ inputJson: this.jobsEditorJson[jobId] } // add iff exists
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
	): [string, Geant4Worker][] {
		const getOrderByFn = orderBy === 'start_time' ? 'getStartTime' : 'getEndTime';

		return Object.entries(this.workers).sort((w1, w2) => {
			if (w1[1] === undefined && w2[1] === undefined) {
				return this.compareString(w1[0], w2[0], orderType === 'descend');
			}

			return this.compareString(
				w1[1][getOrderByFn]?.() ?? '',
				w2[1][getOrderByFn]?.() ?? '',
				orderType === 'descend'
			);
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
		const filteredWorkersEntries = workersEntries.filter(([, w]) => {
			return allowedStates.has(w.getState() as StatusState);
		});

		const paginatedWorkersEntries = filteredWorkersEntries.slice(
			pageSize * (pageIdx - 1),
			pageSize * pageIdx
		);

		return {
			pageCount: Math.ceil(filteredWorkersEntries.length / pageSize),
			simulationsCount: filteredWorkersEntries.length,
			simulations: paginatedWorkersEntries.map(([jobId, worker]) => ({
				jobId,
				title: this.jobsMetadata[jobId]?.title,
				startTime: worker.getStartTime().toString(),
				endTime: worker.getEndTime()?.toString(),
				metadata: {
					inputType: this.jobsMetadata[jobId].inputType,
					simType: 'Geant4',
					server: '',
					platform: 'DIRECT'
				},
				jobState: worker.getState(),
				jobTasksStatus: this.getJobTasksStatus(jobId)
			})),
			message: ''
		};
	}

	async getPageStatus(...args: RequestGetPageStatus): Promise<JobStatusData[] | undefined> {
		const [infoList, cache = true, beforeCacheWrite, signal] = args;

		// IMPORTANT: infoList comes with some order of items that should be kept unchanged
		const workersEntries: [string, Geant4Worker][] = infoList
			.map(info =>
				this.workers.hasOwnProperty(info.jobId)
					? [info.jobId, this.workers[info.jobId]]
					: undefined
			)
			.filter(Boolean);

		return workersEntries.map(([jobId, worker]) => {
			if (this.responseCache.pageStatus.hasOwnProperty(jobId)) {
				return this.responseCache.pageStatus[jobId];
			}

			const response = {
				jobId,
				title: this.jobsMetadata[jobId]?.title,
				startTime: worker.getStartTime().toString(),
				endTime: worker.getEndTime()?.toString(),
				metadata: {
					inputType: this.jobsMetadata[jobId].inputType,
					simType: 'Geant4',
					server: '',
					platform: 'DIRECT'
				},
				jobState: worker.getState(),
				jobTasksStatus: this.getJobTasksStatus(jobId)
			} as JobStatusData;

			if (worker.getState() === StatusState.COMPLETED) {
				this.responseCache.pageStatus[jobId] = response;

				if (cache) beforeCacheWrite?.(jobId, response);
			}

			return response;
		});
	}

	cancelJob(info: SimulationInfo, signal?: AbortSignal | undefined): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
