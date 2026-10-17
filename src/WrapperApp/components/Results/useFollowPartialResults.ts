import { useEffect, useRef } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useStore } from '../../../services/StoreService';
import { JobUnknownStatus, StatusState } from '../../../types/ResponseTypes';
import { FullSimulationData } from '../../../types/SimulationService';
import { snakeToCamelCase } from '../../../util/Notation/Notation';
import { partialRevision } from '../../../util/partialResults';

// a stream refused (e.g. an expired token) is opened again after this long
const REOPEN_MS = 5000;
const FINAL_STATES = new Set([StatusState.COMPLETED, StatusState.FAILED, StatusState.CANCELED]);

/**
 * Keeps partial results on screen up to date. The server pushes the simulation's status whenever its state or
 * partial results change (server-sent events); a new partial, or the final results, replaces the shown status and
 * EstimatorsSelect loads the estimator on screen again.
 */
export function useFollowPartialResults(simulation: FullSimulationData | undefined) {
	const { backendUrl } = useConfig();
	const { setResultsSimulationData } = useStore();
	// read when an event comes, so updating the results does not reopen the stream
	const latest = useRef(simulation);
	latest.current = simulation;

	const jobId = simulation?.jobId;
	const following = simulation !== undefined && partialRevision(simulation) !== undefined;

	useEffect(() => {
		if (!following || !jobId) return;
		let source: EventSource | undefined;
		let reopen: ReturnType<typeof setTimeout> | undefined;

		const open = () => {
			source = new EventSource(
				`${backendUrl}/events/simulation?job_id=${encodeURIComponent(jobId)}`,
				{ withCredentials: true }
			);

			source.onmessage = event => {
				const status = snakeToCamelCase(
					JSON.parse(event.data) as object,
					true
				) as JobUnknownStatus;

				// the server ends the stream after a final state, the browser would open it again
				if (status.jobState && FINAL_STATES.has(status.jobState)) source?.close();
				const shown = latest.current;

				if (!shown || shown.jobId !== jobId) return;
				const updated = { ...shown, ...status } as FullSimulationData;

				if (partialRevision(updated) !== partialRevision(shown))
					setResultsSimulationData({ source: 'onLoad', data: updated });
			};

			source.onerror = () => {
				if (source?.readyState === EventSource.CLOSED) reopen = setTimeout(open, REOPEN_MS);
			};
		};
		open();

		return () => {
			clearTimeout(reopen);
			source?.close();
		};
	}, [following, jobId, backendUrl, setResultsSimulationData]);
}
