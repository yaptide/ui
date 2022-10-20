import { ReactNode, useCallback, useRef } from 'react';
import { BACKEND_URL } from '../util/Config';
import { createGenericContext } from '../util/GenericContext';
import { useAuth } from './AuthService';
import { IResponseMsg } from './ResponseTypes';
import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { ScoringManagerJSON } from '../ThreeEditor/util/Scoring/ScoringManager';
import { orderAccordingToList } from '../util/Sort';
import { FilterJSON } from '../ThreeEditor/util/Detect/DetectFilter';

export enum OrderType {
	ASCEND = 'ascend',
	DESCEND = 'descend'
}

export enum OrderBy {
	START_TIME = 'start_time',
	END_TIME = 'end_time'
}

export interface ShSimulationProps {
	children: ReactNode;
}

export interface IShSimulation {
	sendRun: (
		input: { editorJSON: unknown } | { inputFiles: InputFiles },
		signal?: AbortSignal
	) => Promise<ResShRun>;
	convertToInputFiles: (editorJSON: unknown, signal?: AbortSignal) => Promise<ResShConvert>;
	sendHelloWorld: (signal?: AbortSignal) => Promise<unknown>;
	getStatus: (
		simulation: SimulationInfo,
		signal?: AbortSignal,
		cache?: boolean,
		beforeCacheWrite?: (id: string, data: SimulationStatusData) => void
	) => Promise<SimulationStatusData | undefined>;
	getSimulations: (
		pageNumber: number,
		pageSize: number,
		orderType: OrderType,
		orderBy: OrderBy,
		signal?: AbortSignal
	) => Promise<UserSimulationPage>;
	getSimulationsStatus: (
		simulationInfo: SimulationInfo[],
		signal?: AbortSignal,
		cache?: boolean,
		beforeCacheWrite?: (id: string, data: SimulationStatusData) => void
	) => Promise<SimulationStatusData[]>;
}

interface ResShRun extends IResponseMsg {
	task_id: string;
}

export interface SimulationInfo {
	start_time: Date;
	end_time: Date;
	cores: number;
	name: string;
	task_id: string;
}

interface ResUserSimulations extends IResponseMsg, UserSimulationPage {}

interface UserSimulationPage {
	simulations: SimulationInfo[];
	page_count: number;
	simulations_count: number;
}

export enum StatusState {
	PENDING = 'PENDING',
	PROGRESS = 'PROGRESS',
	FAILURE = 'FAILURE',
	SUCCESS = 'SUCCESS',
	LOCAL = 'LOCAL'
}
interface ResShStatusPending extends IResponseMsg {
	state: StatusState.PENDING;
}

interface ResShStatusProgress extends IResponseMsg {
	state: StatusState.PROGRESS;
	info: {
		simulated_primaries: number;
		estimated?: {
			hours: number;
			minutes: number;
			seconds: number;
		};
	};
}

export interface InputFiles {
	'beam.dat': string;
	'detect.dat': string;
	'geo.dat': string;
	'mat.dat': string;
}

interface ResShConvert extends IResponseMsg {
	input_files: InputFiles;
}

interface ResShStatusFailure extends IResponseMsg {
	state: StatusState.FAILURE;
	error: string;
	input_files?: InputFiles;
	logfile?: string;
}

interface ResShStatusSuccess extends IResponseMsg {
	state: StatusState.SUCCESS;
	result: {
		estimators: Estimator[];
	};
	metadata: {
		source: string;
		simulator: string;
		type: 'results';
	};
	input_json?: EditorJson;
	input_files?: InputFiles;
	end_time: Date;
	cores: number;
}

type ResShStatus =
	| ResShStatusPending
	| ResShStatusProgress
	| ResShStatusFailure
	| ResShStatusSuccess;

export interface FinalSimulationStatusData extends SimulationStatusData {
	cores: number;
	inputFiles: InputFiles;
	result: {
		estimators: Estimator[];
	};
	metadata: {
		source: string;
		simulator: string;
		type: 'results';
	};
}
export interface SimulationStatusData {
	uuid: string;
	status: StatusState;
	creationDate: Date;
	completionDate: Date;
	name: string;
	estimatedTime?: number;
	counted?: number;
	message?: string;
	inputFiles?: InputFiles;
	logFile?: string;
	cores?: number;
	metadata?: {
		source: string;
		simulator: string;
		type: 'results';
	};
	result?: {
		estimators: Estimator[];
	};
	editor?: EditorJson;
}

const recreateOrderInEstimators = (
	estimators: Estimator[],
	scoringManagerJSON: ScoringManagerJSON
): Estimator[] => {
	return orderAccordingToList(
		estimators,
		scoringManagerJSON.scoringOutputs,
		'name',
		(e, o) => (e.scoringOutputJsonRef = o)
	);
};

const recreateRefToFilters = (estimators: Estimator[], FiltersJSON: FilterJSON[]): Estimator[] => {
	estimators.forEach(estimator => {
		const { pages, scoringOutputJsonRef } = estimator;
		pages.forEach((page, idx) => {
			const quantity = scoringOutputJsonRef?.quantities.active[idx];
			const filter = FiltersJSON.find(o => o.uuid === quantity?.filter);
			page.filterRef = filter;
			page.name = quantity?.name;
		});
	});
	return estimators;
};

export const recreateRefsInResults = (results: SimulationStatusData) => {
	const { result, editor } = results;

	if (!editor) throw new Error('No editor data');
	if (!result) throw new Error('No result data');

	const { scoringManager, detectManager }: EditorJson = editor;

	result.estimators = recreateOrderInEstimators(result.estimators, scoringManager);
	result.estimators = recreateRefToFilters(result.estimators, detectManager?.filters);
};

const [useShSimulation, ShSimulationContextProvider] = createGenericContext<IShSimulation>();

const ShSimulation = (props: ShSimulationProps) => {
	const { authKy } = useAuth();

	const statusDataCache = useRef(new Map<string, SimulationStatusData>());

	const sendHelloWorld = useCallback(
		(signal?: AbortSignal) => authKy.get(`${BACKEND_URL}`, { signal }).json(),
		[authKy]
	);

	const sendRun = useCallback(
		(input: { editorJSON: unknown } | { inputFiles: InputFiles }, signal?: AbortSignal) => {
			let json;
			if ('editorJSON' in input) {
				json = input.editorJSON;
			} else if ('inputFiles' in input) {
				json = { input_files: { ...input.inputFiles } };
			}

			return authKy
				.post(`${BACKEND_URL}/sh/run`, {
					signal,
					json: json,
					timeout: 30000
					/**
			Timeout in milliseconds for getting a response. Can not be greater than 2147483647.
			If set to `false`, there will be no timeout.
			**/
				})
				.json()
				.then((response: unknown) => {
					return response as ResShRun;
				});
		},
		[authKy]
	);

	const convertToInputFiles = useCallback(
		(editorJSON: unknown, signal?: AbortSignal) =>
			authKy
				.post(`${BACKEND_URL}/sh/convert`, {
					signal,
					json: editorJSON
				})
				.json()
				.then((response: unknown) => {
					return response as ResShConvert;
				}),
		[authKy]
	);

	const getStatus = useCallback(
		(
			simulation: SimulationInfo,
			signal?: AbortSignal,
			cache = true,
			beforeCacheWrite?: (id: string, response: SimulationStatusData) => void
		) => {
			const {
				task_id: taskId,
				name,
				start_time: creationDate,
				end_time: completionDate
			} = simulation;

			if (cache && statusDataCache.current.has(taskId))
				return Promise.resolve(statusDataCache.current.get(taskId));

			return authKy
				.post(`${BACKEND_URL}/sh/status`, {
					signal,
					json: { task_id: taskId }
				})
				.json()
				.then((response: unknown) => {
					const resStatus = response as ResShStatus;

					const data: SimulationStatusData = {
						uuid: taskId,
						status: resStatus.state,
						name,
						creationDate,
						completionDate
					};

					switch (resStatus.state) {
						case StatusState.PENDING:
							break;

						case StatusState.PROGRESS:
							data.counted = resStatus.info.simulated_primaries;
							if (resStatus.info.estimated) {
								const { hours, minutes, seconds } = resStatus.info.estimated;
								data.estimatedTime =
									Date.now() + (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
							}
							break;

						case StatusState.FAILURE:
							data.message = resStatus.error;
							data.inputFiles = resStatus.input_files;
							data.logFile = resStatus.logfile;
							break;

						case StatusState.SUCCESS:
							data.result = resStatus.result;
							data.inputFiles = resStatus.input_files;
							data.cores = resStatus.cores;
							data.metadata = resStatus.metadata;
							// remove trailing underscores from estimators names (#530)
							for (const estimator of data.result.estimators) {
								estimator.name = estimator.name.replace(/_$/, '');
							}

							if (resStatus.input_json) {
								data.editor = resStatus.input_json;
								recreateRefsInResults(data);
							}
							break;
					}

					if ([StatusState.FAILURE, StatusState.SUCCESS].includes(resStatus.state)) {
						beforeCacheWrite?.call(null, data.uuid, data);
						statusDataCache.current.set(data.uuid, data);
					}

					return data;
				})
				.catch(() => undefined);
		},
		[authKy]
	);

	const getSimulations = useCallback(
		(
			pageNumber: number,
			pageSize: number,
			orderType: OrderType,
			orderBy: OrderBy,
			signal?: AbortSignal
		) => {
			return authKy
				.get(`${BACKEND_URL}/user/simulations`, {
					signal: signal,
					searchParams: {
						page_size: pageSize,
						page_idx: pageNumber - 1,
						order_by: orderBy,
						order_type: orderType
					}
				})
				.json()
				.then((response: unknown) => {
					const { simulations, page_count, simulations_count } =
						response as ResUserSimulations;
					return {
						simulations: simulations.map(s => {
							const start_time = new Date(s.start_time as unknown as string);
							const obj: SimulationInfo = { ...s, start_time };
							return obj;
						}),
						page_count,
						simulations_count
					};
				});
		},
		[authKy]
	);

	const getSimulationsStatus = useCallback(
		(
			simulations: SimulationInfo[],
			signal?: AbortSignal,
			cache = true,
			beforeCacheWrite?: (id: string, response: SimulationStatusData) => void
		) => {
			const res = simulations.map(s => getStatus(s, signal, cache, beforeCacheWrite));

			return Promise.all(res).then(values => {
				return [...values.filter((e): e is SimulationStatusData => !!e)];
			});
		},
		[getStatus]
	);

	const value: IShSimulation = {
		sendRun,
		convertToInputFiles,
		sendHelloWorld,
		getStatus,
		getSimulations,
		getSimulationsStatus
	};

	return (
		<ShSimulationContextProvider value={value}>{props.children}</ShSimulationContextProvider>
	);
};

export { useShSimulation, ShSimulation };
