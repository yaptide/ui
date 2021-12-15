import { ReactNode, useCallback, useRef } from 'react';
import { BACKEND_URL } from '../util/Config';
import { createGenericContext } from '../util/GenericContext';
import { useAuth } from './AuthService';
import { IResponseMsg } from './ResponseTypes';
import { Estimator } from '../JsRoot/GraphData';

export interface ShSimulationProps {
	children: ReactNode;
}

export interface IShSimulation {
	sendRun: (editorJSON: unknown, signal?: AbortSignal) => Promise<ResShRun>;
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
	content: {
		task_id: string;
	};
}

export interface SimulationInfo {
	creation_date: Date;
	name: string;
	task_id: string;
}

interface ResUserSimulations extends IResponseMsg {
	content: {
		simulations: SimulationInfo[];
	};
}

export enum StatusState {
	PENDING = 'PENDING',
	PROGRESS = 'PROGRESS',
	FAILURE = 'FAILURE',
	SUCCESS = 'SUCCESS'
}
interface ResShStatusPending extends IResponseMsg {
	content: {
		state: StatusState.PENDING;
	};
}

interface ResShStatusProgress extends IResponseMsg {
	content: {
		state: StatusState.PROGRESS;
		info: {
			simulated_primaries: number;
			estimated?: {
				hours: number;
				minutes: number;
				seconds: number;
			};
		};
	};
}

interface InputFiles {
	'beam.dat': string;
	'detect.dat': string;
	'geo.dat': string;
	'mat.dat': string;
}
interface ResShStatusFailure extends IResponseMsg {
	content: {
		state: StatusState.FAILURE;
		error: string;
		input_files?: InputFiles;
		shieldhitlog?: string;
	};
}

interface ResShStatusSuccess extends IResponseMsg {
	content: {
		state: StatusState.SUCCESS;
		result: {
			estimators: Estimator[];
		};
	};
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
	shieldhitlog?: string;
	result?: {
		estimators: Estimator[];
	};
}

const [useShSimulation, ShSimulationContextProvider] = createGenericContext<IShSimulation>();

const ShSimulation = (props: ShSimulationProps) => {
	const { authKy } = useAuth();

	const statusDataCache = useRef(new Map<string, SimulationStatusData>());

	const sendHelloWorld = useCallback(
		(signal?: AbortSignal) => authKy.get(`${BACKEND_URL}`, { signal }).json(),
		[authKy]
	);

	const sendRun = useCallback(
		(editorJSON: unknown, signal?: AbortSignal) =>
			authKy
				.post(`${BACKEND_URL}/sh/run`, {
					signal,
					json: editorJSON,
					timeout: 30000
					/**
            Timeout in milliseconds for getting a response. Can not be greater than 2147483647.
            If set to `false`, there will be no timeout.
            **/
				})
				.json()
				.then((response: unknown) => {
					return response as ResShRun;
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
					const { content } = resStatus;

					const data: SimulationStatusData = {
						uuid: taskId,
						status: content.state,
						name,
						creationDate
					};

					switch (content.state) {
						case StatusState.PENDING:
							break;

						case StatusState.PROGRESS:
							data.counted = content.info.simulated_primaries;
							if (content.info.estimated) {
								const { hours, minutes, seconds } = content.info.estimated;
								data.estimatedTime =
									Date.now() + (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
							}
							break;

						case StatusState.FAILURE:
							data.message = content.error;
							data.inputFiles = content.input_files;
							data.shieldhitlog = content.shieldhitlog;
							break;

						case StatusState.SUCCESS:
							data.result = content.result;
							break;
					}

					if ([StatusState.FAILURE, StatusState.SUCCESS].includes(content.state)) {
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
					return (response as ResUserSimulations).content.simulations.map(s => {
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
