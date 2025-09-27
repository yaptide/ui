import { useState } from 'react';

import { useConfig } from '../../../../config/ConfigService';
import { useGeant4WorkersSimulation } from '../../../../services/Geant4WorkersSimulationContextProvider';
import { useRestSimulation } from '../../../../services/RestSimulationContextProvider';
import { useStore } from '../../../../services/StoreService';
import { JobStatusData, SimulationInfo, ValidStatusStates } from '../../../../types/ResponseTypes';
import useIntervalAsync from '../../../../util/hooks/useIntervalAsync';
import DeleteSimulationModal from '../Modal/DeleteSimulationModal';
import { PaginatedSimulationsGrid } from '../SimulationCardGrid';
import { useBackendAliveEffect } from './hooks/useBackendAliveEffect';
import { useUpdateCurrentSimulationEffect } from './hooks/useUpdateCurrentSimulationEffect';
import SimulationsGridHelpers from './SimulationsGridHelpers';
import {
	SimulationConfig,
	SimulationHandlers,
	SimulationsGridProps,
	SimulationState
} from './SimulationsGridTypes';

export const Geant4WorkersSimulationsGrid = (props: SimulationsGridProps) => {
	const { goToResults, setInputFiles, setShowInputFilesEditor } = props;

	const { demoMode } = useConfig();
	const { yaptideEditor, trackedId, setResultsSimulationData, setLocalResultsSimulationData } =
		useStore();

	const handlers = useGeant4WorkersSimulation();

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
