import { useEffect } from 'react';

import { currentJobStatusData, StatusState } from '../../../../../types/ResponseTypes';
import { SimulationConfig, SimulationHandlers, SimulationState } from '../SimulationsGridTypes';

export const useUpdateCurrentSimulationEffect = (
	config: SimulationConfig,
	handlers: SimulationHandlers,
	state: SimulationState
) => {
	const { shouldConnect, controller } = config;
	const { getJobInputs, getFullSimulationData } = handlers;
	const { simulationsStatusData, yaptideEditor } = state;

	useEffect(() => {
		const updateCurrentSimulation = async () => {
			if (shouldConnect && yaptideEditor) {
				const hash = yaptideEditor.toSerialized().hash;
				const currentStatus = simulationsStatusData?.find(async s => {
					if (currentJobStatusData[StatusState.COMPLETED](s)) {
						const jobInputs = await getJobInputs(s, controller.signal);

						return jobInputs?.input.inputJson?.hash === hash;
					}

					return false;
				});

				const currentSimulation = currentStatus
					? await getFullSimulationData(currentStatus, controller.signal)
					: undefined;

				if (currentSimulation) yaptideEditor.setResults(currentSimulation);
				else yaptideEditor.setResults(null);
			}
		};
		updateCurrentSimulation();
	}, [
		simulationsStatusData,
		yaptideEditor,
		getJobInputs,
		controller.signal,
		getFullSimulationData,
		shouldConnect
	]);
};
