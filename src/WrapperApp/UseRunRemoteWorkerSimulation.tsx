import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { useRemoteWorkerSimulation } from '../services/RemoteWorkerSimulationContextProvider';
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

export function useRunRemoteWorkerSimulation(): RunSimulationFunctionType {
	const { setTrackedId, setSimulationJobIdsSubmittedInSession } = useStore();
	const [controller] = useState(new AbortController());
	const { postJob } = useRemoteWorkerSimulation();
	const sendSimulationRequest = (
		postJobFn: typeof postJob,
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
			options = {
				...batchOptions,
				arrayOptions: batchOptions.arrayOptions?.reduce(
					(acc, curr) => {
						acc[curr.optionKey] = curr.optionValue;

						return acc;
					},
					{} as Record<string, string>
				),
				collectOptions: batchOptions.collectOptions?.reduce(
					(acc, curr) => {
						acc[curr.optionKey] = curr.optionValue;

						return acc;
					},
					{} as Record<string, string>
				)
			};
		}

		postJobFn(
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
					{ jobId: res.jobId, source: 'remote' },
					...jobs
				]);
				enqueueSnackbar('Simulation submitted', { variant: 'success' });
			})
			.catch(e => {
				enqueueSnackbar('Error while starting simulation', { variant: 'error' });
				console.error(e);
			});
	};

	return (runType, ...rest) => sendSimulationRequest(postJob, runType, ...rest);
}
