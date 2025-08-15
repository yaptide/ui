import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { useShSimulation } from '../services/ShSimulatorService';
import { useStore } from '../services/StoreService';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';
import {
	BatchOptionsType,
	SimulationRunType,
	SimulationSourceType
} from '../WrapperApp/components/Simulation/RunSimulationForm';
import { RunSimulationFunctionType } from './components/Simulation/RunSimulationForm';

export function useRunSimulation(): RunSimulationFunctionType {
	const { setTrackedId } = useStore();
	const [controller] = useState(new AbortController());
	const { postJobDirect, postJobBatch } = useShSimulation();
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

		const options =
			runType === 'batch'
				? {
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
					}
				: undefined;

		postJobFn(simData, sourceType, nTasks, simulator, simName, options, controller.signal)
			.then(res => {
				setTrackedId(res.jobId);
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
