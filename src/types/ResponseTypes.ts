import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';
import { SimulatorType } from './RequestTypes';
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

export function toSimulationInputFiles(simulator: SimulatorType, inputFiles: ShInputFilesRecord | TopasInputFilesRecord | FlukaInputFilesRecord ): SimulationInputFiles {
	switch (simulator) {
		case SimulatorType.SHIELDHIT: return toShieldhitInputFiles(inputFiles as unknown as ShInputFilesRecord);
		case SimulatorType.TOPAS: return toTopasInputFiles(inputFiles as unknown as TopasInputFilesRecord);
		case SimulatorType.FLUKA: return toFlukaInputFiles(inputFiles as unknown as FlukaInputFilesRecord);
	}
}

function toShieldhitInputFiles(inputFiles: ShInputFilesRecord): SimulationInputFiles {
	return {
		"beam.dat": inputFiles["beam.dat"],
		"geo.dat": inputFiles["geo.dat"],
		"detect.dat": inputFiles["detect.dat"],
		"mat.dat": inputFiles["mat.dat"],
	}
}

function toTopasInputFiles(inputFiles: TopasInputFilesRecord): SimulationInputFiles {
	return {
		"topas_config.txt": inputFiles["topas_config.txt"],
	}
}

function toFlukaInputFiles(inputFiles: FlukaInputFilesRecord): SimulationInputFiles {
	return {
		"fl_sim.inp": inputFiles["fl_sim.inp"],
	}
}

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
		jobTasksStatus: Array<TaskUnknownStatus>;
	}
>;

type JobStatusRunning = JobStatusType<
	StatusState.RUNNING,
	{ jobTasksStatus: Array<TaskUnknownStatus> }
>;

type JobStatusPending = JobStatusType<StatusState.PENDING, {}>;

type JobStatusFailed = JobStatusType<StatusState.FAILED, {}>;

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
