import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { useGeant4LocalWorkerSimulation } from '../services/Geant4LocalWorkerSimulationContextProvider';
import { useStore } from '../services/StoreService';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';
import { Geant4DatasetsType } from './components/Simulation/Geant4DatasetDownload';
import {
	BatchOptionsType,
	RunSimulationFunctionType,
	SimulationRunType,
	SimulationSourceType
} from './components/Simulation/RunSimulationForm';

export function useRunGeant4LocalWorkerSimulation(): RunSimulationFunctionType {
	const { setTrackedId, setSimulationJobIdsSubmittedInSession } = useStore();
	const [controller] = useState(new AbortController());
	const { postJob } = useGeant4LocalWorkerSimulation();
	const sendSimulationRequest = (
		runType: SimulationRunType,
		editorJson: EditorJson,
		inputFiles: Partial<SimulationInputFiles>,
		sourceType: SimulationSourceType,
		simName: string,
		nTasks: number,
		simulator: SimulatorType,
		batchOptions: BatchOptionsType,
		geant4DatasetType: Geant4DatasetsType
	) => {
		const simData = sourceType === 'editor' ? editorJson : inputFiles;

		let options = undefined;

		if (runType === 'batch') {
			throw new Error('Geant4 does not support running in batch');
		}

		postJob(
			simData,
			sourceType,
			runType,
			nTasks,
			simulator,
			simName,
			options,
			geant4DatasetType,
			controller.signal
		)
			.then(res => {
				setTrackedId(res.jobId);
				setSimulationJobIdsSubmittedInSession(jobs => [
					{ jobId: res.jobId, source: 'local' },
					...jobs
				]);
				enqueueSnackbar('Simulation submitted', { variant: 'success' });
			})
			.catch(e => {
				enqueueSnackbar('Error while starting simulation', { variant: 'error' });
				console.error(e);
			});
	};

	return (runType, ...rest) => sendSimulationRequest(runType, ...rest);
}
