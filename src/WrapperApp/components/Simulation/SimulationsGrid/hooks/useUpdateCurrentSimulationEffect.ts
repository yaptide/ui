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
		// every poll starts a new run; a slower older run must not overwrite what a newer one set
		let stale = false;
		const updateCurrentSimulation = async () => {
			if (shouldConnect && yaptideEditor) {
				const hash = yaptideEditor.toSerialized().hash;
				// find() with an async callback always took the first simulation, a promise is truthy
				let currentStatus;

				for (const s of simulationsStatusData ?? []) {
					if (!currentJobStatusData[StatusState.COMPLETED](s)) continue;
					// one failed request must not stop the search
					const jobInputs = await getJobInputs(s, controller.signal).catch(
						() => undefined
					);

					if (jobInputs?.input.inputJson?.hash === hash) {
						currentStatus = s;

						break;
					}
				}

				const currentSimulation = currentStatus
					? await getFullSimulationData(currentStatus, controller.signal).catch(
							() => undefined
						)
					: undefined;

				if (stale) return;

				if (currentSimulation) yaptideEditor.setResults(currentSimulation);
				else yaptideEditor.setResults(null);
			}
		};
		updateCurrentSimulation();

		return () => {
			stale = true;
		};
	}, [
		simulationsStatusData,
		yaptideEditor,
		getJobInputs,
		controller.signal,
		getFullSimulationData,
		shouldConnect
	]);
};
