import { useEffect, useState } from 'react';

import { useConfig } from '../../../../../config/ConfigService';
import { useRestSimulation } from '../../../../../services/RestSimulationContextProvider';
import { useStore } from '../../../../../services/StoreService';
import { ValidStatusStates } from '../../../../../types/ResponseTypes';
import { SimulationConfig, SimulationHandlers } from '../SimulationsGridTypes';

export const useBackendAliveEffect = (
	config: SimulationConfig,
	handlers: SimulationHandlers,
	updateSimulationInfo: () => void = () => {},
	setPageCount: (count: number) => void = () => {}
) => {
	const { demoMode, controller, trackedId, isBackendAlive, setBackendAlive } = config;
	const { getHelloWorld } = handlers;

	useEffect(() => {
		if (!demoMode)
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
		demoMode,
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
		demoMode,
		controller,
		trackedId,
		isBackendAlive,
		setBackendAlive,
		statusStates: ValidStatusStates
	};

	const handlers = useRestSimulation();

	useBackendAliveEffect(config, handlers);

	return isBackendAlive;
};
