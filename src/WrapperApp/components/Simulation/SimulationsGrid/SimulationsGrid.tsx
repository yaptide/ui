import { useState } from 'react';

import { useConfig } from '../../../../config/ConfigService';
import { useRestSimulation } from '../../../../services/RestSimulationContextProvider';
import { useStore } from '../../../../services/StoreService';
import { SimulatorType } from '../../../../types/RequestTypes';
import {
	JobStatusData,
	SimulationInfo,
	SimulationInputFiles,
	ValidStatusStates
} from '../../../../types/ResponseTypes';
import useIntervalAsync from '../../../../util/hooks/useIntervalAsync';
import DeleteSimulationModal from '../Modal/DeleteSimulationModal';
import { PaginatedSimulationsGrid } from '../SimulationCardGrid';
import { useBackendAliveEffect } from './hooks/useBackendAliveEffect';
import { useUpdateCurrentSimulationEffect } from './hooks/useUpdateCurrentSimulationEffect';
import SimulationsGridHelpers from './SimulationsGridHelpers';
import { SimulationConfig, SimulationHandlers, SimulationState } from './SimulationsGridTypes';

interface SimulationsGridProps {
	goToResults?: () => void;
	setInputFiles: (inputFiles: SimulationInputFiles | undefined) => void;
	setShowInputFilesEditor: (show: boolean) => void;
	simulator: SimulatorType;
}

export const SimulationsGrid = (props: SimulationsGridProps) => {
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
	} = useRestSimulation();

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
		pageData,
		isModalOpen,
		setIsModalOpen,
		submitDelete
	} = SimulationsGridHelpers(config, handlers, state);

	useBackendAliveEffect(config, handlers, updateSimulationInfo, setPageCount);
	useUpdateCurrentSimulationEffect(config, handlers, state);

	useIntervalAsync(updateSimulationData, simulationDataInterval, simulationInfo.length > 0);

	return (
		<>
			<PaginatedSimulationsGrid
				simulations={simulationsStatusData}
				pageData={pageData}
				handleLoadResults={handleLoadResults}
				handleRefresh={updateSpecificSimulationData}
				handleCancel={cancelSpecificSimulation}
				handleDelete={deleteSpecificSimulation}
				handleShowInputFiles={handleShowInputFiles}
				isBackendAlive={isBackendAlive}
				simulator={props.simulator}
			/>
			{isModalOpen && (
				<DeleteSimulationModal
					open={isModalOpen}
					setOpen={setIsModalOpen}
					onConfirm={submitDelete}
				/>
			)}
		</>
	);
};
