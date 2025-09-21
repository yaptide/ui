import Geant4Worker from '../Geant4Worker/Geant4Worker';
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
	Geant4InputFilesNames,
	InputFilesRecord,
	JobStatusData,
	JobUnknownStatus,
	ResponseGetPageContents,
	ResponsePostJob,
	SimulationInfo,
	SimulationInputFiles,
	StatusState
} from '../types/ResponseTypes';
import { FullSimulationData, SimulationService } from '../types/SimulationService';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';

type JobId = string;

interface JobMetadata {
	title: string;
	inputType: SimulationSourceType;
}

export default class Geant4WorkersSimulationService implements SimulationService {
	convertJSON: PythonConverterContext['convertJSON'];
	workers: Record<JobId, Geant4Worker>;
	inputFiles: Record<JobId, Record<string, string>>;
	jobsEditorJson: Record<JobId, EditorJson>;
	jobsMetadata: Record<JobId, JobMetadata>;

	constructor(convertJSON: PythonConverterContext['convertJSON']) {
		this.convertJSON = convertJSON;
		this.workers = {};
		this.inputFiles = {};
		this.jobsEditorJson = {};
		this.jobsMetadata = {};
	}

	async helloWorld(signal?: AbortSignal): Promise<boolean> {
		return Promise.resolve(true);
	}

	async postJob(...args: RequestPostJob): Promise<ResponsePostJob> {
		let [simData, inputType, ntasks, simType, title, batchOptions, signal] = args;

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

		worker.init().then(async () => {
			await worker.loadDepsLazy();

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

		if (!this.inputFiles.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		return {
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
		};
	}

	async getJobStatus(...args: RequestGetJobStatus): Promise<JobStatusData | undefined> {
		const [info, cache = true, beforeCacheWrite, signal] = args;
		const { jobId } = info;

		if (!this.workers.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		return {
			jobId,
			title: this.jobsMetadata[jobId]?.title,
			startTime: this.workers[jobId].getStartTime().toString(),
			metadata: {
				inputType: this.jobsMetadata[jobId].inputType,
				simType: this.jobsMetadata[jobId].inputType,
				server: '',
				platform: 'DIRECT'
			},
			jobState: this.workers[jobId].getState()
		};
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

	async getJobResults(...args: RequestGetJobResults): Promise<JobResults | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;
		const { jobId } = info;

		if (!this.workers.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		return {
			jobId,
			estimators: [],
			message: ''
		};
	}

	async getEstimatorsPages(...args: RequestGetJobResult): Promise<JobResults | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;
		const { jobId, estimatorName, pageNumbers } = info;

		if (!this.workers.hasOwnProperty(info.jobId)) {
			return undefined;
		}

		return {
			jobId,
			estimators: [],
			message: ''
		};
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

		return {
			jobId,
			title: this.jobsMetadata[jobId]?.title,
			startTime: this.workers[jobId].getStartTime().toString(),
			metadata: {
				inputType: this.jobsMetadata[jobId].inputType,
				simType: this.jobsMetadata[jobId].inputType,
				server: '',
				platform: 'DIRECT'
			},
			input: {
				inputType: this.jobsMetadata[jobId].inputType,
				inputFiles: this.inputFiles[jobId] as InputFilesRecord<Geant4InputFilesNames, ''>,
				...{ inputJson: this.jobsEditorJson[jobId] } // add iff exists
			},
			estimators: []
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
				metadata: {
					inputType: this.jobsMetadata[jobId].inputType,
					simType: this.jobsMetadata[jobId].inputType,
					server: '',
					platform: 'DIRECT'
				},
				jobState: worker.getState()
			})),
			message: ''
		};
	}

	async getPageStatus(...args: RequestGetPageStatus): Promise<JobStatusData[] | undefined> {
		const [infoList, cache = true, beforeCacheWrite, signal] = args;
		const jobIds = new Set(infoList.map(il => il.jobId));
		const workersEntries = Object.entries(this.workers).filter(([jobId]) => jobIds.has(jobId));

		return workersEntries.map(([jobId, worker]) => ({
			jobId,
			title: this.jobsMetadata[jobId]?.title,
			startTime: worker.getStartTime()?.toString(),
			metadata: {
				inputType: this.jobsMetadata[jobId].inputType,
				simType: this.jobsMetadata[jobId].inputType,
				server: '',
				platform: 'DIRECT'
			},
			jobState: worker.getState()
		}));
	}

	cancelJob(info: SimulationInfo, signal?: AbortSignal | undefined): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
