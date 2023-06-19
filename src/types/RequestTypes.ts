import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { Flatten } from './TypeTransformUtil';
import { JobInputs, JobLogs, JobResults } from '../services/ShSimulatorService';
import { JobStatusData, SimulationInfo, SimulationInputFiles } from './ResponseTypes';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';

/* ------------Utility types------------ */
export enum OrderType {
	ASCEND = 'ascend',
	DESCEND = 'descend'
}

export enum OrderBy {
	START_TIME = 'start_time',
	END_TIME = 'end_time'
}

export enum SimulatorType {
	SHIELDHIT = 'shieldhit',
	TOPAS = 'topas',
	FLUKA = 'fluka'
}

export type RequestParam = [signal?: AbortSignal];

/* ------------------------------------ */
type InputDataParam = [
	simData: EditorJson | Partial<SimulationInputFiles>,
	inputType: SimulationSourceType,
	ntasks?: number,
	simType?: string,
	title?: string,
	batchOptions?: {
		clusterName?: string;
		arrayOptions?: Record<string, string>;
		arrayHeader?: string;
		collectOptions?: Record<string, string>;
		collectHeader?: string;
	}
];

type LoginParams = [username: string, password: string];

type CachedDataParams<T> = [cache?: boolean, beforeCacheWrite?: (id: string, response: T) => void];

type PageParams = [pageIdx: number, pageSize: number, orderType: OrderType, orderBy: OrderBy];

type SimInfoParam = [info: SimulationInfo];
type SimInfoArrayParam = [infoList: Array<SimulationInfo>];

type InputConvertParam = [simData: EditorJson];

/* ------------------------------------ */
// Types for request functions
export type RequestAuthLogin = LoginParams;

export type RequestAuthLogout = [];

export type RequestAuthRefresh = [];

export type RequestAuthStatus = [];

export type RequestShConvert = Flatten<[InputConvertParam, RequestParam]>;

export type RequestTopasConvert = Flatten<[InputConvertParam, RequestParam]>;

export type RequestPostJob = Flatten<[InputDataParam, RequestParam]>;

export const isEditorJson = (data: any): data is EditorJson => {
	return data && data.metadata && data.metadata.title;
};

export type RequestCancelJob = Flatten<[SimInfoParam, RequestParam]>;

export type RequestGetPageContents = Flatten<[PageParams, RequestParam]>;

export type RequestGetPageStatus = Flatten<
	[SimInfoArrayParam, CachedDataParams<JobStatusData>, RequestParam]
>;

export type RequestGetJobStatus = Flatten<
	[SimInfoParam, CachedDataParams<JobStatusData>, RequestParam]
>;

export type RequestGetJobLogs = Flatten<
	[[{ jobId: string }], RequestParam, CachedDataParams<JobLogs>]
>;

export type RequestGetJobInputs = Flatten<
	[[{ jobId: string }], RequestParam, CachedDataParams<JobInputs>]
>;

export type RequestGetJobResults = Flatten<
	[[{ jobId: string }], RequestParam, CachedDataParams<JobResults>]
>;

/* ------------------------------------ */
