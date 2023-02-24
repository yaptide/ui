import { ReactNode, useCallback, useRef } from 'react';
import { BACKEND_URL } from '../util/Config';
import { createGenericContext } from '../util/GenericContext';
import { useAuth } from './AuthService';
import { IResponse } from './ResponseTypes';
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
	cancelSimulation: (simulation: SimulationInfo, signal?: AbortSignal) => Promise<unknown>;
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

interface ResShRun extends IResponse {
	job_id: string;
}

export interface SimulationInfo {
	start_time: Date;
	end_time: Date;
	ntasks: number;
	platform: string;
	name: string;
	job_id: string;
}

interface ResUserSimulations extends IResponse, UserSimulationPage {}

interface UserSimulationPage {
	simulations: SimulationInfo[];
	page_count: number;
	simulations_count: number;
}

export enum StatusState {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	FAILED = 'FAILED',
	COMPLETED = 'COMPLETED',
	LOCAL = 'LOCAL'
}

export interface InputFiles {
	'beam.dat': string;
	'detect.dat': string;
	'geo.dat': string;
	'mat.dat': string;
}

type TaskInfo = {
	requested_particles: number;
	simulated_primaries: number;
};

type TimeEstimated = {
	hours: number;
	minutes: number;
	seconds: number;
};

type ResShMetadata = {
	input: string;
	simulator: string;
	type: 'results';
};

interface ResShConvert extends IResponse {
	input_files: InputFiles;
}

interface ResShJobStatusPending extends IResponse {
	job_state: StatusState.PENDING;
}

interface ResShJobStatusRunning extends IResponse {
	job_state: StatusState.RUNNING;
	job_tasks_status: {
		task_id: number;
		task_state: StatusState;
		task_info: TaskInfo;
		estimated?: TimeEstimated;
	}[];
}

interface ResShJobStatusFailed extends IResponse {
	job_state: StatusState.FAILED;
	error: string;
	input_files?: InputFiles;
	logfile?: string;
}

interface ResShJobStatusCompleted extends IResponse {
	job_state: StatusState.COMPLETED;
	result: {
		estimators: Estimator[];
	};
	metadata: ResShMetadata;
	input_json?: EditorJson;
	input_files?: InputFiles;
	end_time: Date;
}

type ResShJobStatus =
	| ResShJobStatusPending
	| ResShJobStatusRunning
	| ResShJobStatusFailed
	| ResShJobStatusCompleted;

export interface FinalSimulationStatusData extends SimulationStatusData {
	ntasks: number;
	inputFiles: InputFiles;
	result: {
		estimators: Estimator[];
	};
	metadata: ResShMetadata;
}
export interface SimulationRunJSON {
	jobs?: number;
	sim_type?: string;
	sim_name?: string;
	sim_data: unknown;
}

export interface SimulationStatusData {
	uuid: string;
	job_state: StatusState;
	creationDate: Date;
	completionDate: Date;
	name: string;
	estimatedTime?: number[];
	task_info?: TaskInfo[];
	message?: string;
	inputFiles?: InputFiles;
	logFile?: string;
	ntasks?: number;
	platform?: string;
	metadata?: ResShMetadata;
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

const getDateFromEstimation = (estimated: TimeEstimated) => {
	const { hours, minutes, seconds } = estimated;
	const date = Date.now() + (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
	return date;
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
			let json: SimulationRunJSON = { sim_data: {} };
			if ('editorJSON' in input) {
				const editorJSON = input.editorJSON;
				json.sim_data = editorJSON;
				json.sim_name = (editorJSON as any).project.title;
			} else if ('inputFiles' in input) {
				json.sim_data = { input_files: { ...input.inputFiles } };
			}

			return authKy
				.post(`${BACKEND_URL}/jobs/direct`, {
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
				job_id,
				name,
				start_time: creationDate,
				end_time: completionDate,
				platform,
				ntasks
			} = simulation;

			if (cache && statusDataCache.current.has(job_id))
				return Promise.resolve(statusDataCache.current.get(job_id));

			return authKy
				.get(`${BACKEND_URL}/jobs/direct`, {
					signal,
					searchParams: {
						job_id
					}
				})
				.json()
				.then((response: unknown) => {
					console.log(response);
					const resStatus = response as ResShJobStatus;
					const data: SimulationStatusData = {
						uuid: job_id,
						job_state: resStatus.job_state,
						platform,
						ntasks,
						name,
						creationDate,
						completionDate
					};
					console.log(simulation, resStatus);

					switch (resStatus.job_state) {
						case StatusState.PENDING:
							break;

						case StatusState.RUNNING:
							data.task_info = resStatus.job_tasks_status.map(o => o.task_info);
							data.estimatedTime = resStatus.job_tasks_status.map(o =>
								o.estimated ? getDateFromEstimation(o.estimated) : -1
							);
							break;

						case StatusState.FAILED:
							data.message = resStatus.error;
							data.inputFiles = resStatus.input_files;
							data.logFile = resStatus.logfile;
							break;

						case StatusState.COMPLETED:
							data.result = resStatus.result;
							data.inputFiles = resStatus.input_files;
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

					if ([StatusState.FAILED, StatusState.COMPLETED].includes(resStatus.job_state)) {
						beforeCacheWrite?.call(null, data.uuid, data);
						statusDataCache.current.set(data.uuid, data);
					}

					return data;
				})
				.catch(() => undefined);
		},
		[authKy]
	);

	const cancelSimulation = useCallback(
		(simulation: SimulationInfo, signal?: AbortSignal) => {
			const { job_id } = simulation;
			return authKy.delete(`${BACKEND_URL}/jobs/direct`, {
				signal: signal,
				searchParams: {
					job_id
				}
			});
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
				return [...values.filter((e): e is SimulationStatusData => e !== undefined)];
			});
		},
		[getStatus]
	);

	const value: IShSimulation = {
		sendRun,
		cancelSimulation,
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
