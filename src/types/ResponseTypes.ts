import { Estimator, Page } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';
import { DataWithStatus, LookUp, TypeIdentifiedByKey } from './TypeTransformUtil';

/* ------------Utility types------------ */
export enum StatusState {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	MERGING_QUEUED = 'MERGING_QUEUED',
	MERGING_RUNNING = 'MERGING_RUNNING',
	FAILED = 'FAILED',
	COMPLETED = 'COMPLETED',
	LOCAL = 'LOCAL',
	CANCELED = 'CANCELED',
	UNKNOWN = 'UNKNOWN'
}

export const ValidStatusStates = Object.values(StatusState).filter(
	v => v !== StatusState.UNKNOWN && v !== StatusState.LOCAL
);

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

export const _defaultGeant4Files = {
	'geometry.gdml': '',
	'run.mac': ''
} as const;

export const _orderedGeant4InputFilesNames = ['info.json', 'geometry.gdml', 'run.mac'] as const;

export function isKnownInputFile(name: string): name is ShInputFilesNames {
	return _orderedShInputFilesNames.includes(name as ShInputFilesNames);
}

export type ShInputFilesNames = (typeof _orderedShInputFilesNames)[number];
export type TopasInputFilesNames = (typeof _orderedTopasInputFilesNames)[number];
export type FlukaInputFilesNames = (typeof _orderedFlukaInputFilesNames)[number];
export type Geant4InputFilesNames = (typeof _orderedGeant4InputFilesNames)[number];

export type InputFilesRecord<FileNames extends string, OptionalNames extends string> = Omit<
	{
		[Key in Exclude<FileNames, OptionalNames>]: string;
	} & {
		[Key in OptionalNames]?: string;
	},
	never
>;
export type ShInputFilesRecord = InputFilesRecord<
	ShInputFilesNames,
	'info.json' | 'sobp.dat' | 'detect.dat'
>;
type TopasInputFilesRecord = InputFilesRecord<TopasInputFilesNames, 'info.json'>;
type FlukaInputFilesRecord = InputFilesRecord<FlukaInputFilesNames, 'info.json'>;
type Geant4InputFilesRecord = InputFilesRecord<Geant4InputFilesNames, 'info.json'>;
export type SimulationInputFiles =
	| ShInputFilesRecord
	| TopasInputFilesRecord
	| FlukaInputFilesRecord
	| Geant4InputFilesRecord;

export type TaskTime = {
	hours: string;
	minutes: string;
	seconds: string;
};

export type MetaKey = 'server' | 'platform' | 'inputType' | 'simType';

export type PlatformType = 'DIRECT' | 'BATCH';

export type SimulationInfo = {
	jobId: string;
	title: string;
	metadata: Record<MetaKey, string> & { platform: PlatformType };
	startTime: string;
	endTime?: string;
	localData?: boolean;
	endpointUrl?: string;
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
		source?: string;
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
// Types defining all possible types of task status data
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

export type TaskStatusCompleted = TaskStatusType<
	StatusState.COMPLETED,
	{ startTime: string; endTime: string }
>;

export type TaskStatusPending = TaskStatusType<StatusState.PENDING, {}>;

export type TaskStatusFailed = TaskStatusType<StatusState.FAILED, {}>;

export type TaskStatusRunning = TaskStatusType<StatusState.RUNNING, { estimatedTime?: TaskTime }>;

type TaskAllStatuses =
	| TaskStatusCompleted
	| TaskStatusPending
	| TaskStatusFailed
	| TaskStatusRunning;

/**
 * This type is used to represent the status of a task of unknown type.
 * To make it easier to read, it is a shorthand for `Partial<ObjUnionToKeyUnion<TaskAllStatuses>>`
 * and should equal to it in all cases.
 */
export type TaskUnknownStatus = {
	startTime?: string | undefined;
	endTime?: string | undefined;
	taskState?:
		| StatusState.PENDING
		| StatusState.RUNNING
		| StatusState.FAILED
		| StatusState.COMPLETED
		| undefined;
	requestedPrimaries?: number | undefined;
	simulatedPrimaries?: number | undefined;
	taskId?: number | undefined;
	estimatedTime?: TaskTime | undefined;
};
/* ------------------------------------ */

/* ------------------------------------ */
// Types defining all possible types of job status data
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

export type JobStatusCanceled = JobStatusType<
	StatusState.CANCELED,
	{
		jobTasksStatus: Array<TaskUnknownStatus>;
	}
>;

export type JobStatusMergingQueued = JobStatusType<
	StatusState.MERGING_QUEUED,
	{
		jobTasksStatus: Array<TaskUnknownStatus>;
	}
>;

export type JobStatusMergingRunning = JobStatusType<
	StatusState.MERGING_RUNNING,
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

type JobAllStatuses =
	| JobStatusCompleted
	| JobStatusRunning
	| JobStatusPending
	| JobStatusMergingQueued
	| JobStatusMergingRunning
	| JobStatusFailed
	| JobStatusCanceled;

/**
 * This type is used to represent the status of a job of unknown type.
 * To make it easier to read, it is a shorthand for `Partial<ObjUnionToKeyUnion<JobAllStatuses>>`
 * and should equal to it in all cases.
 */
export type JobUnknownStatus = {
	jobState?:
		| StatusState.PENDING
		| StatusState.RUNNING
		| StatusState.MERGING_QUEUED
		| StatusState.MERGING_RUNNING
		| StatusState.FAILED
		| StatusState.COMPLETED
		| StatusState.CANCELED;
	message?: string;
	jobTasksStatus?: Array<TaskUnknownStatus>;
};

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
	[StatusState.MERGING_QUEUED]: (
		data: unknown
	): data is JobStatusMap[StatusState.MERGING_QUEUED] =>
		jobStatusGuard(data, StatusState.MERGING_QUEUED),
	[StatusState.MERGING_RUNNING]: (
		data: unknown
	): data is JobStatusMap[StatusState.MERGING_RUNNING] =>
		jobStatusGuard(data, StatusState.MERGING_RUNNING),
	[StatusState.PENDING]: (data: unknown): data is JobStatusMap[StatusState.PENDING] =>
		jobStatusGuard(data, StatusState.PENDING),
	[StatusState.FAILED]: (data: unknown): data is JobStatusMap[StatusState.FAILED] =>
		jobStatusGuard(data, StatusState.FAILED),
	[StatusState.CANCELED]: (data: unknown): data is JobStatusMap[StatusState.CANCELED] =>
		jobStatusGuard(data, StatusState.CANCELED),
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
	[StatusState.MERGING_QUEUED]: JobStatusMergingQueued & SimulationInfo;
	[StatusState.MERGING_RUNNING]: JobStatusMergingRunning & SimulationInfo;
	[StatusState.PENDING]: JobStatusPending & SimulationInfo;
	[StatusState.FAILED]: JobStatusFailed & SimulationInfo;
	[StatusState.CANCELED]: JobStatusCanceled & SimulationInfo;
};

type TaskStatusMap = {
	[StatusState.COMPLETED]: TaskStatusCompleted;
	[StatusState.RUNNING]: TaskStatusRunning;
	[StatusState.PENDING]: TaskStatusPending;
	[StatusState.FAILED]: TaskStatusFailed;
};

export type ResponseGetJobInputs = {
	input: {
		inputFiles: SimulationInputFiles;
		inputJson?: EditorJson;
		inputType: SimulationSourceType;
		estimatorsItems?: EstimatorPagesByDimensions[];
	};
} & YaptideResponse;

export type EstimatorsItemResponse = {
	estimatorsMetadata: EstimatorItem[];
	message: string;
};

export type EstimatorItem = {
	name: string;
	pagesMetadata: PageItem[];
};

type PageItem = {
	pageDimension: number;
	pageName: string;
	pageNumber: number;
};

export type PageDimension = {
	names: string[];
	pageNums: number[];
};

export type EstimatorPagesByDimensions = {
	name: string;
	pagesByDimensions: Record<string, PageDimension>;
};

export type ResponseGetJobLogs = {
	logfiles: Record<string, string>;
} & YaptideResponse;

export type ResponseGetJobResults = {
	estimators: Estimator[];
} & YaptideResponse;

export type ResponseGetJobResult = Estimator & YaptideResponse;

export type ResponseGetEstimatorPageResult = { pages: Page[] } & YaptideResponse;

export type ResponseAuthStatus = AuthStatus;

export type ResponseAuthRefresh = AuthData;

export type ResponseAuthLogin = Required<AuthData>;

export type ResponseShConvert = DataConverted;

export type ResponseTopasConvert = DataConverted;

export type ResponsePostJob = JobCreated;

export type ResponseGetPageContents = SimulationsPage;

export type ResponseGetJobStatus = JobAllStatuses;

export type ResponseCancelJob = ResponseJobRequestFailure | YaptideResponse;
