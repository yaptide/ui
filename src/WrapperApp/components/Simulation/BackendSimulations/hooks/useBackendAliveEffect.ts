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

		return () => {
			// Fix for ky 1.7.4 signal abort update
			//controller.abort();
		};
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
