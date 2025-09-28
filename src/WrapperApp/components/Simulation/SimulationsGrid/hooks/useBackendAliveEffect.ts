import { useEffect, useState } from 'react';

import { useConfig } from '../../../../../config/ConfigService';
import { useRemoteWorkerSimulation } from '../../../../../services/RemoteWorkerSimulationContextProvider';
import { useStore } from '../../../../../services/StoreService';
import {
	JobStatusData,
	SimulationInfo,
	ValidStatusStates
} from '../../../../../types/ResponseTypes';
import SimulationGridHelpers from '../SimulationsGridHelpers';
import { SimulationConfig, SimulationHandlers, SimulationState } from '../SimulationsGridTypes';

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
		setBackendAlive,
		statusStates: ValidStatusStates
	};

	const handlers = useRemoteWorkerSimulation();

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

	const { updateSimulationInfo, setPageCount } = SimulationGridHelpers(config, handlers, state);

	useBackendAliveEffect(config, handlers, updateSimulationInfo, setPageCount);

	return isBackendAlive;
};
