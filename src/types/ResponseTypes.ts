import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import {
	IntersectionToObject,
	TypeIdentifiedByKey,
	ObjUnionToKeyUnion,
	LookUp,
	DataWithStatus
} from './TypeTransformUtil';

/* ------------Utility types------------ */
export enum StatusState {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	FAILED = 'FAILED',
	COMPLETED = 'COMPLETED',
	LOCAL = 'LOCAL'
}

export type YaptideResponse = {
	message: string;
};
export const _orderedInputFilesNames = [
	'info.json',
	'geo.dat',
	'mat.dat',
	'beam.dat',
	'detect.dat',
	'sobp.dat'
] as const;

export const _defaultInputFiles = {
	'geo.dat': '',
	'beam.dat': '',
	'detect.dat': '',
	'mat.dat': ''
} as const;

export function isKnownInputFile(name: string): name is SimulationInputFilesNames {
	return _orderedInputFilesNames.includes(name as SimulationInputFilesNames);
}
export type SimulationInputFilesNames = (typeof _orderedInputFilesNames)[number];
export type RequiredInputFilesNames = Exclude<SimulationInputFilesNames, 'info.json' | 'sobp.dat'>;

export type SimulationInputFiles = {
	[Key in RequiredInputFilesNames]: string;
} & {
	[Key in Exclude<SimulationInputFilesNames, RequiredInputFilesNames>]?: string;
} & {
	[Key in Exclude<string, SimulationInputFilesNames>]: string;
};

export type TaskTime = {
	hours: string;
	minutes: string;
	seconds: string;
};

export type MetaKey = 'server' | 'platform' | 'input' | 'simType';

type PlatformType = 'DIRECT' | 'BATCH';

export type SimulationInfo = {
	jobId: string;
	title: string;
	metadata: Record<MetaKey, string> & { platform: PlatformType };
	startTime: Date;
	endTime?: Date;
	localData?: boolean;
};
/* ------------------------------------ */

type AuthData = IntersectionToObject<
	{
		accessExp: number;
		refreshExp?: number;
	} & YaptideResponse
>;

type AuthStatus = IntersectionToObject<
	{
		username: string;
	} & YaptideResponse
>;

type DataConverted = IntersectionToObject<
	{
		inputFiles: SimulationInputFiles;
	} & YaptideResponse
>;

type JobCreated = IntersectionToObject<
	{
		jobId: string;
	} & YaptideResponse
>;

type SimulationsPage = IntersectionToObject<
	{
		pageCount: number;
		simulationsCount: number;
		simulations: Array<SimulationInfo>;
	} & YaptideResponse
>;

/* ------------------------------------ */
// Types defining all posible types of task status data
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

type TaskSatusCompleted = TaskStatusType<StatusState.COMPLETED, { runTime: TaskTime }>;

type TaskStatusPending = TaskStatusType<StatusState.PENDING, {}>;

type TaskStatusFailed = TaskStatusType<StatusState.FAILED, {}>;

type TaskStatusRunning = TaskStatusType<StatusState.RUNNING, { estimatedTime?: TaskTime }>;

type TaskAllStatuses =
	| TaskSatusCompleted
	| TaskStatusPending
	| TaskStatusFailed
	| TaskStatusRunning;

type TaskUnknownStatus = Partial<ObjUnionToKeyUnion<TaskAllStatuses>>;
/* ------------------------------------ */

/* ------------------------------------ */
// Types defining all posible types of job status data
type JobStatusType<T extends StatusState, U extends Object> = TypeIdentifiedByKey<
	'jobState',
	T,
	U & YaptideResponse
>;

type JobStatusCompleted = JobStatusType<
	StatusState.COMPLETED,
	{
		inputFiles: SimulationInputFiles;
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
		inputFiles: SimulationInputFiles;
		logfile: string;
	}
>;

type JobAllStatuses = JobStatusCompleted | JobStatusRunning | JobStatusPending | JobStatusFailed;

type JobUnknownStatus = Partial<ObjUnionToKeyUnion<JobAllStatuses>>;

type ResponseJobRequestFailure = IntersectionToObject<
	{
		exitCode: number;
		output: string;
	} & YaptideResponse
>;
/* ------------------------------------ */

function taskStatusGuard<T extends StatusState>(
	data: unknown,
	value: T
): data is TaskStatusData<T> {
	return (data as TaskStatusData<T>).taskState === value;
}

function jobStatusGuard<T extends StatusState>(data: unknown, value: T): data is JobStatusData<T> {
	return (data as JobStatusData<T>).jobState === value;
}

/* ------------------------------------ */
// Util maps to check if data is of specific status type
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
/* ------------------------------------ */

/* ------------------------------------ */
// Types for responses
export type TaskStatusData<T = null> = DataWithStatus<
	TaskAllStatuses,
	'taskState',
	T,
	{},
	TaskUnknownStatus
>;

export type JobStatusData<T = null> = DataWithStatus<
	JobAllStatuses,
	'jobState',
	T,
	SimulationInfo,
	JobUnknownStatus
>;

export type ResponseAuthStatus = AuthStatus;

export type ResponseAuthRefresh = AuthData;

export type ResponseAuthLogin = Required<AuthData>;

export type ResponseShConvert = DataConverted;

export type ResponsePostJob = JobCreated;

export type ResponseGetPageContents = SimulationsPage;

export type ResponseGetJobStatus = JobAllStatuses;

export type ResponseCancelJob = ResponseJobRequestFailure | YaptideResponse;
