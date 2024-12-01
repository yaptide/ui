import { useEffect } from 'react';

import { currentJobStatusData, StatusState } from '../../../../../types/ResponseTypes';
import { SimulationConfig, SimulationHandlers, SimulationState } from '../BackendSimulationsTypes';

export const useUpdateCurrentSimulationEffect = (
	config: SimulationConfig,
	handlers: SimulationHandlers,
	state: SimulationState
) => {
	const { demoMode, controller } = config;
	const { getJobInputs, getFullSimulationData } = handlers;
	const { simulationsStatusData, yaptideEditor } = state;

	useEffect(() => {
		const updateCurrentSimulation = async () => {
			if (!demoMode && yaptideEditor) {
				const hash = yaptideEditor.toJSON().hash;
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
		demoMode
	]);
};
