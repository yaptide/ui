import { useEffect, useState } from 'react';

import { useConfig } from '../../../../config/ConfigService';
import { useShSimulation } from '../../../../services/ShSimulatorService';
import { useStore } from '../../../../services/StoreService';
import {
	JobStatusData,
	SimulationInfo,
	SimulationInputFiles
} from '../../../../types/ResponseTypes';
import useIntervalAsync from '../../../../util/hooks/useIntervalAsync';
import { PaginatedSimulationsFromBackend } from '../SimulationCardGrid';
import BackendSimulationsHelpers from './BackendSimulationsHelpers';
import { SimulationConfig, SimulationHandlers, SimulationState } from './BackendSimulationsTypes';
import { useBackendAliveEffect } from './hooks/useBackendAliveEffect';
import { useUpdateCurrentSimulationEffect } from './hooks/useUpdateCurrentSimulationEffect';

interface BackendSimulationsProps {
	goToResults?: () => void;
	setInputFiles: (inputFiles: SimulationInputFiles | undefined) => void;
	setShowInputFilesEditor: (show: boolean) => void;
}

export const BackendSimulations = (props: BackendSimulationsProps) => {
	const { goToResults, setInputFiles, setShowInputFilesEditor } = props;

	const { demoMode } = useConfig();
	const { yaptideEditor, trackedId, setResultsSimulationData, setLocalResultsSimulationData } =
		useStore();

	const {
		cancelJob,
		getJobInputs,
		getHelloWorld,
		getPageContents,
		getPageStatus,
		getJobStatus,
		getFullSimulationData
	} = useShSimulation();

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

	const handlers: SimulationHandlers = {
		getPageContents,
		getPageStatus,
		getJobStatus,
		getFullSimulationData,
		cancelJob,
		getHelloWorld,
		getJobInputs
	};

	const state: SimulationState = {
		simulationInfo,
		simulationsStatusData,
		setSimulationInfo,
		setSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		goToResults,
		setInputFiles,
		setShowInputFilesEditor,
		yaptideEditor
	};

	const {
		updateSimulationInfo,
		updateSimulationData,
		updateSpecificSimulationData,
		simulationDataInterval,
		handleLoadResults,
		handleShowInputFiles,
		setPageCount,
		cancelSpecificSimulation,
		deleteSpecificSimulation,
		pageData
	} = BackendSimulationsHelpers(config, handlers, state);

	useBackendAliveEffect(config, handlers, updateSimulationInfo, setPageCount);
	useUpdateCurrentSimulationEffect(config, handlers, state);

	useIntervalAsync(updateSimulationData, simulationDataInterval, simulationInfo.length > 0);

	useEffect(() => {
		return () => {
			controller.abort();
		};
	}, [controller]);

	return (
		<PaginatedSimulationsFromBackend
			simulations={simulationsStatusData}
			subtitle={'Yaptide backend server'}
			pageData={pageData}
			handleLoadResults={handleLoadResults}
			handleRefresh={updateSpecificSimulationData}
			handleCancel={cancelSpecificSimulation}
			handleDelete={deleteSpecificSimulation}
			handleShowInputFiles={handleShowInputFiles}
			isBackendAlive={isBackendAlive}
		/>
	);
};
