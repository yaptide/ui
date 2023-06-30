import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';
import {
	DataWithStatus,
	LookUp,
	ObjUnionToKeyUnion,
	TypeIdentifiedByKey
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
export const _orderedShInputFilesNames = [
	'info.json',
	'geo.dat',
	'beam.dat',
	'detect.dat',
	'mat.dat',
	'sobp.dat'
] as const;

export const _defaultShInputFiles = {
	'geo.dat': '',
	'beam.dat': '',
	'detect.dat': '',
	'mat.dat': ''
} as const;

export const _orderedTopasInputFilesNames = ['info.json', 'topas_config.txt'] as const;

export const _defaultTopasInputFiles = {
	'topas_config.txt': ''
} as const;

export const _orderedFlukaInputFilesNames = ['info.json', 'fl_sim.inp'] as const;

export const _defaultFlukaInputFiles = {
	'fl_sim.inp': ''
} as const;

export function isKnownInputFile(name: string): name is ShInputFilesNames {
	return _orderedShInputFilesNames.includes(name as ShInputFilesNames);
}
export type ShInputFilesNames = (typeof _orderedShInputFilesNames)[number];
export type TopasInputFilesNames = (typeof _orderedTopasInputFilesNames)[number];
export type FlukaInputFilesNames = (typeof _orderedFlukaInputFilesNames)[number];

export type InputFilesRecord<FileNames extends string, OptionalNames extends string> = Omit<
	| {
			[Key in Exclude<FileNames, OptionalNames>]: string;
	  } & {
			[Key in OptionalNames]?: string;
	  },
	never
>;
type ShInputFilesRecord = InputFilesRecord<ShInputFilesNames, 'info.json' | 'sobp.dat'>;
type TopasInputFilesRecord = InputFilesRecord<TopasInputFilesNames, 'info.json'>;
type FlukaInputFilesRecord = InputFilesRecord<FlukaInputFilesNames, 'info.json'>;
export type SimulationInputFiles =
	| ShInputFilesRecord
	| TopasInputFilesRecord
	| FlukaInputFilesRecord;

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

type AuthData = Omit<
	{
		accessExp: number;
		refreshExp?: number;
	} & YaptideResponse,
	never
>;

type AuthStatus = Omit<
	{
		username: string;
	} & YaptideResponse,
	never
>;

type DataConverted = Omit<
	{
		inputFiles: SimulationInputFiles;
	} & YaptideResponse,
	never
>;

type JobCreated = Omit<
	{
		jobId: string;
	} & YaptideResponse,
	never
>;

type SimulationsPage = Omit<
	{
		pageCount: number;
		simulationsCount: number;
		simulations: Array<SimulationInfo>;
	} & YaptideResponse,
	never
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

export type TaskSatusCompleted = TaskStatusType<
	StatusState.COMPLETED,
	{ startTime: Date; endTime: Date }
>;

export type TaskStatusPending = TaskStatusType<StatusState.PENDING, {}>;

export type TaskStatusFailed = TaskStatusType<StatusState.FAILED, {}>;

export type TaskStatusRunning = TaskStatusType<StatusState.RUNNING, { estimatedTime?: TaskTime }>;

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

export type JobStatusCompleted = JobStatusType<
	StatusState.COMPLETED,
	{
		jobTasksStatus: Array<TaskUnknownStatus>;
	}
>;

export type JobStatusRunning = JobStatusType<
	StatusState.RUNNING,
	{ jobTasksStatus: Array<TaskUnknownStatus> }
>;

export type JobStatusPending = JobStatusType<StatusState.PENDING, {}>;

export type JobStatusFailed = JobStatusType<StatusState.FAILED, {}>;

type JobAllStatuses = JobStatusCompleted | JobStatusRunning | JobStatusPending | JobStatusFailed;

type JobUnknownStatus = Partial<ObjUnionToKeyUnion<JobAllStatuses>>;

type ResponseJobRequestFailure = Omit<
	{
		exitCode: number;
		output: string;
	} & YaptideResponse,
	never
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
	[StatusState.COMPLETED]: (data: unknown): data is TaskStatusMap[StatusState.COMPLETED] =>
		taskStatusGuard(data, StatusState.COMPLETED),
	[StatusState.RUNNING]: (data: unknown): data is TaskStatusMap[StatusState.RUNNING] =>
		taskStatusGuard(data, StatusState.RUNNING),
	[StatusState.PENDING]: (data: unknown): data is TaskStatusMap[StatusState.PENDING] =>
		taskStatusGuard(data, StatusState.PENDING),
	[StatusState.FAILED]: (data: unknown): data is TaskStatusMap[StatusState.FAILED] =>
		taskStatusGuard(data, StatusState.FAILED),
	// eslint-disable-next-line no-useless-computed-key
	['hasSpecificProperty']: <T extends string>(
		data: unknown,
		property: T
	): data is LookUp<TaskAllStatuses, T> =>
		(data as LookUp<TaskAllStatuses, T>)[property] !== undefined
};

export const currentJobStatusData = {
	[StatusState.COMPLETED]: (data: unknown): data is JobStatusMap[StatusState.COMPLETED] =>
		jobStatusGuard(data, StatusState.COMPLETED),
	[StatusState.RUNNING]: (data: unknown): data is JobStatusMap[StatusState.RUNNING] =>
		jobStatusGuard(data, StatusState.RUNNING),
	[StatusState.PENDING]: (data: unknown): data is JobStatusMap[StatusState.PENDING] =>
		jobStatusGuard(data, StatusState.PENDING),
	[StatusState.FAILED]: (data: unknown): data is JobStatusMap[StatusState.FAILED] =>
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

type JobStatusMap = {
	[StatusState.COMPLETED]: JobStatusCompleted & SimulationInfo;
	[StatusState.RUNNING]: JobStatusRunning & SimulationInfo;
	[StatusState.PENDING]: JobStatusPending & SimulationInfo;
	[StatusState.FAILED]: JobStatusFailed & SimulationInfo;
};

type TaskStatusMap = {
	[StatusState.COMPLETED]: TaskSatusCompleted;
	[StatusState.RUNNING]: TaskStatusRunning;
	[StatusState.PENDING]: TaskStatusPending;
	[StatusState.FAILED]: TaskStatusFailed;
};

export type ResponseGetJobInputs = {
	input: {
		inputFiles: SimulationInputFiles;
		inputJson?: EditorJson;
		inputType: SimulationSourceType;
	};
} & YaptideResponse;

export type ResponseGetJobLogs = {
	logfiles: Record<string, string>;
} & YaptideResponse;

export type ResponseGetJobResults = {
	estimators: Estimator[];
} & YaptideResponse;

export type ResponseAuthStatus = AuthStatus;

export type ResponseAuthRefresh = AuthData;

export type ResponseAuthLogin = Required<AuthData>;

export type ResponseShConvert = DataConverted;

export type ResponseTopasConvert = DataConverted;

export type ResponsePostJob = JobCreated;

export type ResponseGetPageContents = SimulationsPage;

export type ResponseGetJobStatus = JobAllStatuses;

export type ResponseCancelJob = ResponseJobRequestFailure | YaptideResponse;
