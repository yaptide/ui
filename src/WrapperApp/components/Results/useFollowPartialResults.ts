import { useEffect, useRef } from 'react';

import { useRemoteWorkerSimulation } from '../../../services/RemoteWorkerSimulationContextProvider';
import { useStore } from '../../../services/StoreService';
import { withStatus } from '../../../services/useSimulationStatusStream';
import { FullSimulationData } from '../../../types/SimulationService';
import { partialRevision } from '../../../util/partialResults';

/**
 * Keeps the results on screen up to date with the status the server pushes (useSimulationStatusStream): a new
 * partial, the final results, or a failed or canceled run replaces the shown status, and EstimatorsSelect loads the
 * estimator on screen again when the partial results changed.
 */
export function useFollowPartialResults(simulation: FullSimulationData | undefined) {
	const { statusStream } = useRemoteWorkerSimulation();
	const { setResultsSimulationData } = useStore();
	// read when a status comes, so updating the results does not apply the same status again
	const latest = useRef(simulation);
	latest.current = simulation;

	const jobId = simulation?.jobId;
	const status = jobId === undefined ? undefined : statusStream?.statuses[jobId];

	useEffect(() => {
		const shown = latest.current;

		if (!status || shown?.jobId !== status.jobId) return;
		const updated = withStatus(shown, status);

		if (
			updated.jobState !== shown.jobState ||
			partialRevision(updated) !== partialRevision(shown)
		)
			setResultsSimulationData({ source: 'onLoad', data: updated });
	}, [status, setResultsSimulationData]);
}
