import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import {
	DataWithStatus,
	IntersectionToObject,
	LookUp,
	TypeIdentifiedByKey
} from './TypeTransformUtil';

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

type AuthData = IntersectionToObject<
	{
		accessExp: number;
		refreshExp?: number;
	} & Response
>;

type InputFiles = {
	'beam.dat': string;
	'detect.dat': string;
	'geo.dat': string;
	'mat.dat': string;
};

export type TaskTime = {
	hours: string;
	minutes: string;
	seconds: string;
};

type AuthStatus = IntersectionToObject<
	{
		username: string;
	} & Response
>;

type DataConverted = IntersectionToObject<
	{
		inputFiles: InputFiles;
	} & Response
>;

type JobCreated = IntersectionToObject<
	{
		jobId: string;
	} & Response
>;

type MetaKey = 'server' | 'platform' | 'input' | 'simType';

export type SimulationInfo = {
	jobId: string;
	title: string;
	metadata: Record<MetaKey, string>;
	startTime: Date;
	endTime?: Date;
	localData?: boolean;
};

export type SimulationsPage = IntersectionToObject<
	{
		pageCount: number;
		simulationsCount: number;
		simulations: Array<SimulationInfo>;
	} & Response
>;

type TaskStatusType<T extends StatusState, U extends {}> = TypeIdentifiedByKey<
	'taskState',
	T,
	U & {
		requestedPrimaries: number;
		simulatedPrimaries: number;
		taskId: number;
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

type UnionToIntersection<U> = (U extends U ? (x: U) => unknown : never) extends (
	x: infer R
) => unknown
	? R
	: never;
export type ObjUnionToKeyUnion<T extends {}, Obj extends {} = {}> = UnionToIntersection<
	T extends any ? () => T : never
> extends () => infer ReturnType
	? ObjUnionToKeyUnion<
			Exclude<T, ReturnType>,
			Omit<
				Omit<Obj, keyof ReturnType> & {
					[K in keyof ReturnType]: (K extends keyof Obj ? Obj[K] : never) | ReturnType[K];
				},
				never
			>
	  >
	: Omit<Obj, never>;

type TaskUnknownStatus = Partial<ObjUnionToKeyUnion<TaskAllStatuses>>;

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
		jobTasksStatus: Array<TaskUnknownStatus>;
	}
>;

type JobStatusRunning = JobStatusType<
	StatusState.RUNNING,
	{ jobTasksStatus: Array<TaskUnknownStatus> }
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

export type JobAllStatuses =
	| JobStatusCompleted
	| JobStatusRunning
	| JobStatusPending
	| JobStatusFailed;

type JobUnknownStatus = Partial<ObjUnionToKeyUnion<JobAllStatuses>>;

type ResponseJobRequestFailure = IntersectionToObject<
	{
		exitCode: number;
		output: string;
	} & Response
>;

export type JobStatusData<T = null> = DataWithStatus<
	JobAllStatuses,
	'jobState',
	T,
	SimulationInfo,
	JobUnknownStatus
>;

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
	// eslint-disable-next-line no-useless-computed-key
	['hasSpecificProperty']: <T extends string>(
		data: unknown,
		property: T
	): data is LookUp<JobAllStatuses, T> =>
		(data as LookUp<JobAllStatuses, T>)[property] !== undefined
};

export type TaskStatusData<T = null> = DataWithStatus<
	TaskAllStatuses,
	'taskState',
	T,
	{},
	TaskUnknownStatus
>;

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
		taskStatusGuard(data, StatusState.FAILED),
	// eslint-disable-next-line no-useless-computed-key
	['hasSpecificProperty']: <T extends string>(
		data: unknown,
		property: T
	): data is LookUp<TaskAllStatuses, T> =>
		(data as LookUp<TaskAllStatuses, T>)[property] !== undefined
};

export type ResponseAuthStatus = AuthStatus;

export type ResponseAuthRefresh = AuthData;

export type ResponseAuthLogin = Required<AuthData>;

export type ResponseShConvert = DataConverted;

export type ResponsePostJob = JobCreated;

export type ResponseGetPageContents = SimulationsPage;

export type ResponseGetJobStatus = JobAllStatuses;

export type ResponseCancelJob = ResponseJobRequestFailure | Response;
