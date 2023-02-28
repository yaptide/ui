import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { JobStatusData, SimulationInfo } from './ResponseTypes';
import { Concat } from './TypeTransformUtil';

export enum OrderType {
	ASCEND = 'ascend',
	DESCEND = 'descend'
}

export interface InputFiles {
	'beam.dat': string;
	'detect.dat': string;
	'geo.dat': string;
	'mat.dat': string;
}

export enum OrderBy {
	START_TIME = 'start_time',
	END_TIME = 'end_time'
}

export type RequestParam = [signal?: AbortSignal];

type InputDataParam = [
	simData: EditorJson | { inputFiles: InputFiles },
	jobs?: number,
	simType?: string,
	simName?: string
];

type LoginParams = [json: { username: string; password: string }];

type CachedDataParams = [
	cache: boolean,
	beforeCacheWrite?: (id: string, response: JobStatusData) => void
];

type PageParams = [pageIdx: number, pageSize: number, orderType: OrderType, orderBy: OrderBy];

type SimInfoParam = [info: SimulationInfo];
type SimInfoArrayParam = [infoList: Array<SimulationInfo>];

type InputConvertParam = [simData: EditorJson];

// export type RequestAuthStatus = AuthStatus;

// export type RequestAuthRefresh = AuthData;

export type RequestAuthLogin = LoginParams;

export type RequestShConvert = Concat<[InputConvertParam, RequestParam]>;

export type RequestPostJob = Concat<[InputDataParam, RequestParam]>;

export const isEditorJson = (data: any): data is EditorJson => {
	return data && data.metadata && data.metadata.title;
};

export type RequestCancelJob = Concat<[SimInfoParam, RequestParam]>;

export type RequestGetPageContents = Concat<[PageParams, RequestParam]>;

export type RequestGetPageStatus = Concat<[SimInfoArrayParam, CachedDataParams, RequestParam]>;

export type RequestGetJobStatus = Concat<[SimInfoParam, CachedDataParams, RequestParam]>;
