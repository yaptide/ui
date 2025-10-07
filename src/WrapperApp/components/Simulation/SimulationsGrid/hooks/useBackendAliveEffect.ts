import { useEffect, useState } from 'react';

import { useConfig } from '../../../../../config/ConfigService';
import { useRemoteWorkerSimulation } from '../../../../../services/RemoteWorkerSimulationContextProvider';
import { useStore } from '../../../../../services/StoreService';
import { ValidStatusStates } from '../../../../../types/ResponseTypes';
import { SimulationConfig, SimulationHandlers } from '../SimulationsGridTypes';

export const useBackendAliveEffect = (
	config: SimulationConfig,
	handlers: SimulationHandlers,
	updateSimulationInfo: () => void = () => {},
	setPageCount: (count: number) => void = () => {}
) => {
	const { shouldConnect, controller, trackedId, isBackendAlive, setBackendAlive } = config;
	const { getHelloWorld } = handlers;

	useEffect(() => {
		if (shouldConnect)
			getHelloWorld(controller.signal)
				.then(() => {
					setBackendAlive(true);
					updateSimulationInfo();
				})
				.catch(() => {
					setBackendAlive(false);
					setPageCount(0);
				});
	}, [
		controller.signal,
		getHelloWorld,
		isBackendAlive,
		shouldConnect,
		trackedId,
		controller,
		setPageCount
	]);
};

export const useIsBackendAlive = () => {
	const { demoMode } = useConfig();
	const { trackedId } = useStore();

	const [isBackendAlive, setBackendAlive] = useState(false);
	const [controller] = useState(new AbortController());

	const config: SimulationConfig = {
		shouldConnect: !demoMode,
		controller,
		trackedId,
		isBackendAlive,
		setBackendAlive,
		statusStates: ValidStatusStates
	};

	const handlers = useRemoteWorkerSimulation();

	useBackendAliveEffect(config, handlers);

	return isBackendAlive;
};
