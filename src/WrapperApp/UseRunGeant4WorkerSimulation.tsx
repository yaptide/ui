import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { useGeant4WorkersSimulation } from '../services/Geant4WorkersSimulationContextProvider';
import { useStore } from '../services/StoreService';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';
import {
	BatchOptionsType,
	RunSimulationFunctionType,
	SimulationRunType,
	SimulationSourceType
} from './components/Simulation/RunSimulationForm';

export function useRunGeant4WorkerSimulation(): RunSimulationFunctionType {
	const { setTrackedId, setSimulationJobIdsSubmittedInSession } = useStore();
	const [controller] = useState(new AbortController());
	const { postJobDirect: postJobToGeant4Worker } = useGeant4WorkersSimulation();
	const sendSimulationRequest = (
		runType: SimulationRunType,
		editorJson: EditorJson,
		inputFiles: Partial<SimulationInputFiles>,
		sourceType: SimulationSourceType,
		simName: string,
		nTasks: number,
		simulator: SimulatorType,
		batchOptions: BatchOptionsType
	) => {
		const simData = sourceType === 'editor' ? editorJson : inputFiles;

		let options = undefined;

		if (runType === 'batch') {
			throw new Error('Geant4 does not support running in batch');
		}

		postJobToGeant4Worker(
			simData,
			sourceType,
			nTasks,
			simulator,
			simName,
			options,
			controller.signal
		)
			.then(res => {
				setTrackedId(res.jobId);
				setSimulationJobIdsSubmittedInSession(jobIds => [res.jobId, ...jobIds]);
				enqueueSnackbar('Simulation submitted', { variant: 'success' });
			})
			.catch(e => {
				enqueueSnackbar('Error while starting simulation', { variant: 'error' });
				console.error(e);
			});
	};

	return (runType, ...rest) => sendSimulationRequest(runType, ...rest);
}
