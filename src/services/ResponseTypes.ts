import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { DataWithStatus, MergeObjects, TypeIdentifiedByKey } from './TypeTransformUtil';

export enum StatusState {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	FAILED = 'FAILED',
	COMPLETED = 'COMPLETED',
	LOCAL = 'LOCAL'
}

export type Response = {
	message: string;
};

type AuthData = MergeObjects<
	{
		accessExp: number;
		refreshExp?: number;
	},
	Response
>;

type InputFiles = {
	'beam.dat': string;
	'detect.dat': string;
	'geo.dat': string;
	'mat.dat': string;
};

type TaskInfo = {
	requestedParticles: number;
	simulatedPrimaries: number;
};

export type TaskTime = {
	hours: string;
	minutes: string;
	seconds: string;
};

type AuthStatus = MergeObjects<
	{
		username: string;
	},
	Response
>;

type DataConverted = MergeObjects<
	{
		inputFiles: InputFiles;
	},
	Response
>;

type JobCreated = MergeObjects<
	{
		jobId: string;
	},
	Response
>;

export type SimulationInfo = {
	jobId: string;
	name: string; //title
	metadata: Record<string, string>;
	startTime: Date;
	endTime?: Date;
};

export type SimulationsPage = MergeObjects<
	{
		pageCount: number;
		simulationsCount: number;
		simulations: Array<SimulationInfo>;
	},
	Response
>;

type TaskStatusType<T extends StatusState, U extends {}> = TypeIdentifiedByKey<
	'taskState',
	T,
	U & {
		taskId: number;
		taskInfo: TaskInfo;
		taskState: T;
	}
>;

export type TaskSatusCompleted = TaskStatusType<StatusState.COMPLETED, { runTime: TaskTime }>;

export type TaskStatusPending = TaskStatusType<StatusState.PENDING, {}>;

export type TaskStatusFailed = TaskStatusType<StatusState.FAILED, {}>;

export type TaskStatusRunning = TaskStatusType<StatusState.RUNNING, { estimatedTime?: TaskTime }>;

export type TaskAllStatuses =
	| TaskSatusCompleted
	| TaskStatusPending
	| TaskStatusFailed
	| TaskStatusRunning;

type JobStatusType<T extends StatusState, U extends Object> = TypeIdentifiedByKey<
	'jobState',
	T,
	U & Response
>;

type JobStatusCompleted = JobStatusType<
	StatusState.COMPLETED,
	{
		inputFiles: InputFiles;
		inputJson?: EditorJson;
		result: {
			estimators: Estimator[];
		};
		jobTasksStatus: Array<TaskAllStatuses>;
	}
>;

type JobStatusLocal = JobStatusType<
	StatusState.LOCAL,
	{
		inputFiles: InputFiles;
		inputJson?: EditorJson;
		result: {
			estimators: Estimator[];
		};
		jobTasksStatus: Array<TaskAllStatuses>;
	}
>;

type JobStatusRunning = JobStatusType<
	StatusState.RUNNING,
	{ jobTasksStatus: Array<TaskAllStatuses> }
>;

type JobStatusPending = JobStatusType<StatusState.PENDING, {}>;

type JobStatusFailed = JobStatusType<
	StatusState.FAILED,
	{
		error: string;
		inputFiles: InputFiles;
		logfile: string;
	}
>;

type JobAllStatuses =
	| JobStatusCompleted
	| JobStatusRunning
	| JobStatusPending
	| JobStatusFailed
	| JobStatusLocal;

export type JobStatusData<T = null> = DataWithStatus<JobAllStatuses, 'jobState', T, SimulationInfo>;

function jobStatusGuard<T extends StatusState>(data: unknown, value: T): data is JobStatusData<T> {
	return (data as JobStatusData<T>).jobState === value;
}

export const currentJobStatusData = {
	[StatusState.COMPLETED]: (data: unknown): data is JobStatusData<StatusState.COMPLETED> =>
		jobStatusGuard(data, StatusState.COMPLETED),
	[StatusState.RUNNING]: (data: unknown): data is JobStatusData<StatusState.RUNNING> =>
		jobStatusGuard(data, StatusState.RUNNING),
	[StatusState.PENDING]: (data: unknown): data is JobStatusData<StatusState.PENDING> =>
		jobStatusGuard(data, StatusState.PENDING),
	[StatusState.FAILED]: (data: unknown): data is JobStatusData<StatusState.FAILED> =>
		jobStatusGuard(data, StatusState.FAILED),
	[StatusState.LOCAL]: (data: unknown): data is JobStatusData<StatusState.LOCAL> =>
		jobStatusGuard(data, StatusState.LOCAL)
};

export type TaskStatusData<T = null> = DataWithStatus<TaskAllStatuses, 'taskState', T>;

function taskStatusGuard<T extends StatusState>(
	data: unknown,
	value: T
): data is TaskStatusData<T> {
	return (data as TaskStatusData<T>).taskState === value;
}

export const currentTaskStatusData = {
	[StatusState.COMPLETED]: (data: unknown): data is TaskStatusData<StatusState.COMPLETED> =>
		taskStatusGuard(data, StatusState.COMPLETED),
	[StatusState.RUNNING]: (data: unknown): data is TaskStatusData<StatusState.RUNNING> =>
		taskStatusGuard(data, StatusState.RUNNING),
	[StatusState.PENDING]: (data: unknown): data is TaskStatusData<StatusState.PENDING> =>
		taskStatusGuard(data, StatusState.PENDING),
	[StatusState.FAILED]: (data: unknown): data is TaskStatusData<StatusState.FAILED> =>
		taskStatusGuard(data, StatusState.FAILED)
};

export type ResponseAuthStatus = AuthStatus;

export type ResponseAuthRefresh = AuthData;

export type ResponseAuthLogin = Required<AuthData>;

export type ResponseShConvert = DataConverted;

export type ResponsePostJob = JobCreated;

export type ResponseGetPageContents = SimulationsPage;

export type ResponseGetJobStatus = JobAllStatuses;
