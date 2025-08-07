import { useEffect, useState } from 'react';

import { useConfig } from '../../../../../config/ConfigService';
import { useShSimulation } from '../../../../../services/ShSimulatorService';
import { useStore } from '../../../../../services/StoreService';
import { JobStatusData, SimulationInfo } from '../../../../../types/ResponseTypes';
import BackendSimulationsHelpers from '../BackendSimulationsHelpers';
import { SimulationConfig, SimulationHandlers, SimulationState } from '../BackendSimulationsTypes';

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

export const useIsBackendAlive = () => {
	const { demoMode } = useConfig();
	const { trackedId, setResultsSimulationData, setLocalResultsSimulationData } = useStore();

	const [isBackendAlive, setBackendAlive] = useState(false);
	const [simulationInfo, setSimulationInfo] = useState<SimulationInfo[]>([]);
	const [simulationsStatusData, setSimulationsStatusData] = useState<JobStatusData[]>();
	const [controller] = useState(new AbortController());

	const config: SimulationConfig = {
		demoMode,
		controller,
		trackedId,
		isBackendAlive,
		setBackendAlive
	};

	const handlers = useShSimulation();

	const state: SimulationState = {
		simulationInfo,
		simulationsStatusData,
		setSimulationInfo,
		setSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		setInputFiles: () => {},
		setShowInputFilesEditor: () => {}
	};

	const { updateSimulationInfo, setPageCount } = BackendSimulationsHelpers(
		config,
		handlers,
		state
	);

	useBackendAliveEffect(config, handlers, updateSimulationInfo, setPageCount);

	return isBackendAlive;
};
