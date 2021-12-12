import { ReactNode, useCallback, useRef } from 'react';
import { BACKEND_URL } from '../util/Config';
import { createGenericContext } from '../util/GenericContext';
import { SimulationStatusData } from '../WrapperApp/components/Simulation/SimulationStatus';
import { useAuth } from './AuthService';
import { IResponseMsg } from './ResponseTypes';

export interface ShSimulationProps {
	children: ReactNode;
}

export interface IShSimulation {
	sendRun: (editorJSON: unknown, signal?: AbortSignal) => Promise<ResShRun>;
	sendHelloWorld: (signal?: AbortSignal) => Promise<unknown>;
	getStatus: (
		taskId: string,
		signal?: AbortSignal,
		cache?: boolean,
		beforeCacheWrite?: (id: string, response: ResShStatus) => void
	) => Promise<SimulationStatusData | undefined>;
	getSimulations: (signal?: AbortSignal) => Promise<string[]>;
	getSimulationsStatus: (
		simulationIDs: string[],
		abortSignal?: AbortSignal,
		cache?: boolean,
		beforeCacheWrite?: (id: string, response: ResShStatus) => void
	) => Promise<SimulationStatusData[]>;
}

interface ResShRun extends IResponseMsg {
	content: {
		task_id: string;
	};
}
interface ResUserSimulations extends IResponseMsg {
	content: {
		tasks_ids: string[];
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

interface ResShStatusFailure extends IResponseMsg {
	content: {
		state: StatusState.FAILURE;
		error: string;
	};
}

interface ResShStatusSuccess extends IResponseMsg {
	content: {
		state: StatusState.SUCCESS;
		result: any;
	};
}

type ResShStatus =
	| ResShStatusPending
	| ResShStatusProgress
	| ResShStatusFailure
	| ResShStatusSuccess;

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
			taskId: string,
			signal?: AbortSignal,
			cache = true,
			beforeCacheWrite?: (id: string, response: ResShStatus) => void
		) => {
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
						status: content.state
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
							break;

						case StatusState.SUCCESS:
							data.result = content.result;
							break;
					}

					if ([StatusState.FAILURE, StatusState.SUCCESS].includes(content.state)) {
						beforeCacheWrite?.call(null, data.uuid, resStatus);
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
					return (response as ResUserSimulations).content.tasks_ids;
				});
		},
		[authKy]
	);

	const getSimulationsStatus = useCallback(
		(
			simulationIDs: string[],
			abortSignal?: AbortSignal,
			cache = true,
			beforeCacheWrite?: (id: string, response: ResShStatus) => void
		) => {
			const res = simulationIDs.map(uuid =>
				getStatus(uuid, abortSignal, cache, beforeCacheWrite)
			);

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
