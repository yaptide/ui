type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
	? `${T extends Uppercase<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
	: S;

type SnakeCaseKeys<T> = { [K in keyof T as CamelToSnakeCase<string & K>]: T[K] };

type CamelToSnakeCaseObject<T> = T extends Array<unknown>
	? Array<CamelToSnakeCaseObject<T[number]>>
	: T extends object
	? SnakeCaseKeys<T>
	: T;

// Define type that has key K of type T and all other keys of type U
type TypeIdentifiedByKey<K extends string, T, U extends Object> = {
	[P in K]: T;
} & U;

// Example usage:
type _ = CamelToSnakeCaseObject<{ someProperty: string; anotherProperty: number }>;
// Result: { some_property: string; another_property: number }

function camelToSnakeCase<T extends Record<string, unknown>>(obj: T): CamelToSnakeCaseObject<T> {
	const result: Record<string, unknown> = {};
	for (const key in obj) {
		const snakeCaseKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
		result[snakeCaseKey] = obj[key];
	}
	return result as CamelToSnakeCaseObject<T>;
}

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
	? `${T}${Capitalize<SnakeToCamelCase<U>>}`
	: S;

type CamelCaseKeys<T> = { [K in keyof T as SnakeToCamelCase<string & K>]: T[K] };

type SnakeToCamelCaseObject<T> = T extends Array<unknown>
	? Array<SnakeToCamelCaseObject<T[number]>>
	: T extends object
	? CamelCaseKeys<T>
	: T;

function snakeToCamelCase<T extends Record<string, unknown>>(obj: T): SnakeToCamelCaseObject<T> {
	const result: Record<string, unknown> = {};
	for (const key in obj) {
		const camelCaseKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
		result[camelCaseKey] = obj[key];
	}
	return result as SnakeToCamelCaseObject<T>;
}

export enum StatusState {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	FAILED = 'FAILED',
	COMPLETED = 'COMPLETED',
	LOCAL = 'LOCAL'
}

export interface IResponse {
	message: string;
}

interface IAuthData extends IResponse {
	accessExp: number;
	refreshExp?: number;
}

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

type TaskTime = {
	hours: string;
	minutes: string;
	seconds: string;
};

interface IAuthStatus extends IResponse {
	loginName: string;
}

interface IDataConverted extends IResponse {
	inputFiles: InputFiles;
}

interface IJobCreated extends IResponse {
	jobId: string;
}

type ISimulation = {
	jobId: string;
	name: string; //title
	metaparameters: Record<string, string>;
	startTime: Date;
	endTime?: Date;
};

interface ISimulationsList extends IResponse {
	pageCount: number;
	simulationsCount: number;
	simulations: Array<ISimulation>;
}

type TaskStatusType<T extends StatusState, U extends Object> = TypeIdentifiedByKey<
	'taskState',
	T,
	U & {
		taskId: string;
		taskInfo: TaskInfo;
	}
>;

interface ITaskSatusCompleted
	extends TaskStatusType<StatusState.COMPLETED, { runTime: TaskTime }>,
		IResponse {}

interface ITaskSatusIncompleted
	extends TaskStatusType<
			Exclude<StatusState, StatusState.COMPLETED>,
			{ estimatedTime?: TaskTime }
		>,
		IResponse {}

type JobStatusType<T extends StatusState, U extends Object> = TypeIdentifiedByKey<'jobState', T, U>;

interface IJobStatusCompleted
	extends JobStatusType<
			StatusState.COMPLETED,
			{
				inputFiles: InputFiles;
				inputJson?: Record<string, unknown>;
				result: Record<string, unknown>;
				jobTasksStatus: Array<ITaskSatusCompleted | ITaskSatusIncompleted>;
			}
		>,
		IResponse {}

interface IJobStatusRunning
	extends JobStatusType<
			StatusState.RUNNING,
			{ jobTasksStatus: Array<ITaskSatusCompleted | ITaskSatusIncompleted> }
		>,
		IResponse {}

interface IJobStatusPending extends JobStatusType<StatusState.PENDING, {}>, IResponse {}

interface IJobStatusFailed
	extends JobStatusType<
			StatusState.FAILED,
			{
				error: string;
				input_files: InputFiles;
				logfile: string;
			}
		>,
		IResponse {}

type JobAllStatuses =
	| IJobStatusCompleted
	| IJobStatusRunning
	| IJobStatusPending
	| IJobStatusFailed;

export type ResponseAuthStatus = CamelToSnakeCaseObject<IAuthStatus>;

export type ResponseAuthRefresh = CamelToSnakeCaseObject<IAuthData>;

export type ResponseAuthLogin = CamelToSnakeCaseObject<Required<IAuthData>>;

export type ResponseShConvert = CamelToSnakeCaseObject<IDataConverted>;

export type ResponsePostJobs = CamelToSnakeCaseObject<IJobCreated>;

export type ResponseGetSimulations = CamelToSnakeCaseObject<ISimulationsList>;

export type ResponseGetJobs = CamelToSnakeCaseObject<JobAllStatuses>;
