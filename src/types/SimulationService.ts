import {
	JobInputs,
	JobLogs,
	JobResults,
	RequestCancelJob,
	RequestGetJobInputs,
	RequestGetJobLogs,
	RequestGetJobResult,
	RequestGetJobResults,
	RequestGetJobStatus,
	RequestGetPageContents,
	RequestGetPageStatus,
	RequestParam,
	RequestPostJob
} from './RequestTypes';
import { JobStatusData, ResponseGetPageContents, ResponsePostJob } from './ResponseTypes';

export type FullSimulationData = Omit<JobInputs & JobStatusData & JobResults, 'message'>;

export interface SimulationContext {
	postJob: (...args: RequestPostJob) => Promise<ResponsePostJob>;
	cancelJob: (...args: RequestCancelJob) => Promise<unknown>;
	getHelloWorld: (...args: RequestParam) => Promise<unknown>;
	getJobStatus: (...args: RequestGetJobStatus) => Promise<JobStatusData | undefined>;
	getJobInputs: (...args: RequestGetJobInputs) => Promise<JobInputs | undefined>;
	getJobResults: (...args: RequestGetJobResults) => Promise<JobResults | undefined>;
	getEstimatorsPages: (...args: RequestGetJobResult) => Promise<JobResults | undefined>;
	getJobLogs: (...args: RequestGetJobLogs) => Promise<JobLogs | undefined>;
	getPageContents: (...args: RequestGetPageContents) => Promise<ResponseGetPageContents>;
	getPageStatus: (...args: RequestGetPageStatus) => Promise<JobStatusData[] | undefined>;
	getFullSimulationData: (
		jobStatus: JobStatusData,
		signal?: AbortSignal,
		cache?: boolean,
		givenEstimatorName?: string
	) => Promise<FullSimulationData | undefined>;
}

export interface SimulationService {
	helloWorld(signal?: AbortSignal): Promise<boolean>;
	postJob(...args: RequestPostJob): Promise<ResponsePostJob>;
	getJobInputs(...args: RequestGetJobInputs): Promise<JobInputs | undefined>;
	getJobStatus(...args: RequestGetJobStatus): Promise<JobStatusData | undefined>;
	getJobLogs(...args: RequestGetJobLogs): Promise<JobLogs | undefined>;
	getJobResults(...args: RequestGetJobResults): Promise<JobResults | undefined>;
	getEstimatorsPages(...args: RequestGetJobResult): Promise<JobResults | undefined>;
	getFullSimulationData(
		jobStatus: JobStatusData,
		signal: AbortSignal,
		cache: boolean,
		givenEstimatorName: string
	): Promise<FullSimulationData | undefined>;
	getPageContents(...args: RequestGetPageContents): Promise<ResponseGetPageContents>;
	getPageStatus(...args: RequestGetPageStatus): Promise<JobStatusData[] | undefined>;
	cancelJob(...args: RequestCancelJob): Promise<void>;
}
