import { useEffect } from 'react';

import { SimulationConfig, SimulationHandlers } from '../BackendSimulationsTypes';

export const useBackendAliveEffect = (
	config: SimulationConfig,
	handlers: SimulationHandlers,
	updateSimulationInfo: () => void,
	setPageCount: (count: number) => void
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
		updateSimulationInfo,
		isBackendAlive,
		setBackendAlive,
		demoMode,
		trackedId,
		controller,
		setPageCount
	]);
};
