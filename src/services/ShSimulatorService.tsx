import { ReactNode, useCallback, useRef } from 'react';
import { BACKEND_URL } from '../util/Config';
import { createGenericContext } from '../util/GenericContext';
import { useAuth } from './AuthService';
import { IResponseMsg } from './ResponseTypes';
import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { ScoringManagerJSON } from '../ThreeEditor/util/Scoring/ScoringManager';
import { orderAccordingToList } from '../util/Sort';

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
	getSimulations: (signal?: AbortSignal) => Promise<SimulationInfo[]>;
	getSimulationsStatus: (
		simulationInfo: SimulationInfo[],
		abortSignal?: AbortSignal,
		cache?: boolean,
		beforeCacheWrite?: (id: string, data: SimulationStatusData) => void
	) => Promise<SimulationStatusData[]>;
}

interface ResShRun extends IResponseMsg {
	task_id: string;
}

export interface SimulationInfo {
	creation_date: Date;
	name: string;
	task_id: string;
}

interface ResUserSimulations extends IResponseMsg {
	simulations: SimulationInfo[];
}

export enum StatusState {
	PENDING = 'PENDING',
	PROGRESS = 'PROGRESS',
	FAILURE = 'FAILURE',
	SUCCESS = 'SUCCESS'
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
	input?: EditorJson | { input_files: InputFiles };
}

type ResShStatus =
	| ResShStatusPending
	| ResShStatusProgress
	| ResShStatusFailure
	| ResShStatusSuccess;

export interface SimulationStatusData {
	uuid: string;
	status: StatusState;
	creationDate: Date;
	name: string;
	estimatedTime?: number;
	counted?: number;
	message?: string;
	inputFiles?: InputFiles;
	logFile?: string;
	result?: {
		estimators: Estimator[];
	};
	editor?: EditorJson;
}

export const recreateOrderInEstimators = (
	estimators: Estimator[],
	scoringManagerJSON: ScoringManagerJSON
): Estimator[] => {
	return orderAccordingToList(estimators, scoringManagerJSON.scoringOutputs, 'name');
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
			const { task_id: taskId, name, creation_date: creationDate } = simulation;

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
						creationDate
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

							// remove trailing underscores from estimators names (#530)
							for (const estimator of data.result.estimators) {
								estimator.name = estimator.name.replace(/_$/, '');
							}

							if (resStatus.input && 'metadata' in resStatus.input) {
								data.editor = resStatus.input;
								data.result.estimators = recreateOrderInEstimators(
									data.result.estimators,
									data.editor.scoringManager
								);
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
		(signal?: AbortSignal) => {
			return authKy
				.get(`${BACKEND_URL}/user/simulations`, { signal })
				.json()
				.then((response: unknown) => {
					return (response as ResUserSimulations).simulations.map(s => {
						const creation_date = new Date(s.creation_date as unknown as string);
						const obj: SimulationInfo = { ...s, creation_date };
						return obj;
					});
				});
		},
		[authKy]
	);

	const getSimulationsStatus = useCallback(
		(
			simulations: SimulationInfo[],
			abortSignal?: AbortSignal,
			cache = true,
			beforeCacheWrite?: (id: string, response: SimulationStatusData) => void
		) => {
			const res = simulations.map(s => getStatus(s, abortSignal, cache, beforeCacheWrite));

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
