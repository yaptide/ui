import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { useRestSimulation } from '../services/RestSimulationContextProvider';
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

export function useRunSimulation(): RunSimulationFunctionType {
	const { setTrackedId, setSimulationJobIdsSubmittedInSession } = useStore();
	const [controller] = useState(new AbortController());
	const { postJobDirect, postJobBatch } = useRestSimulation();
	const sendSimulationRequest = (
		postJobFn: typeof postJobDirect,
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

		postJobFn(simData, sourceType, nTasks, simulator, simName, options, controller.signal)
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

	return (runType, ...rest) =>
		sendSimulationRequest(
			runType === 'direct' ? postJobDirect : postJobBatch,
			runType,
			...rest
		);
}
