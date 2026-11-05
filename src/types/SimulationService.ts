import { PartialResultsWatch } from '../services/usePartialResultsWatch';
import { SimulationStatusStream } from '../services/useSimulationStatusStream';
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
import {
	EstimatorPagesByDimensions,
	JobStatusData,
	ResponseGetPageContents,
	ResponsePostJob
} from './ResponseTypes';

export type FullSimulationData = Omit<JobInputs & JobStatusData & JobResults, 'message'>;

export interface SimulationContext {
	postJob: (...args: RequestPostJob) => Promise<ResponsePostJob>;
	cancelJob: (...args: RequestCancelJob) => Promise<unknown>;
	getHelloWorld: (...args: RequestParam) => Promise<unknown>;
	getJobStatus: (...args: RequestGetJobStatus) => Promise<JobStatusData | undefined>;
	getJobInputs: (...args: RequestGetJobInputs) => Promise<JobInputs | undefined>;
	getJobResults: (...args: RequestGetJobResults) => Promise<JobResults | undefined>;
	getEstimatorsPages: (...args: RequestGetJobResult) => Promise<JobResults | undefined>;
	// the pages the server holds now, by estimator and dimensions (the remote worker only)
	getEstimatorsItems?: (jobId: string) => Promise<EstimatorPagesByDimensions[] | undefined>;
	getJobLogs: (...args: RequestGetJobLogs) => Promise<JobLogs | undefined>;
	getPageContents: (...args: RequestGetPageContents) => Promise<ResponseGetPageContents>;
	getPageStatus: (...args: RequestGetPageStatus) => Promise<JobStatusData[] | undefined>;
	getFullSimulationData: (
		jobStatus: JobStatusData,
		signal?: AbortSignal,
		cache?: boolean,
		givenEstimatorName?: string
	) => Promise<FullSimulationData | undefined>;
	// only the remote worker pushes the status of simulations
	statusStream?: SimulationStatusStream;
	// and merges partial results while someone looks (the remote worker only)
	partialWatch?: PartialResultsWatch;
	// a simulation on screen, beaten for even when the status stream does not list it (statuses polled)
	setShownJobId?: (jobId: string | undefined) => void;
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
		signal?: AbortSignal,
		cache?: boolean,
		givenEstimatorName?: string
	): Promise<FullSimulationData | undefined>;
	getPageContents(...args: RequestGetPageContents): Promise<ResponseGetPageContents>;
	getPageStatus(...args: RequestGetPageStatus): Promise<JobStatusData[] | undefined>;
	cancelJob(...args: RequestCancelJob): Promise<void>;
}
