import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../services/AuthService';
import { FullSimulationData } from '../../../types/SimulationService';
import { partialRevision } from '../../../util/partialResults';

type OnDemandResponse = { requested: boolean; available: boolean };

export type OnDemandPages = {
	// the server can deliver on-demand pages (it keeps results in object storage)
	available: boolean;
	// asked for, and not in the partial results yet
	requested: boolean;
	// the request is on its way to the server
	sending: boolean;
	request: () => Promise<void>;
};

/**
 * The on-demand pages of a running simulation on the server: partial results carry points and lines (0D and 1D pages)
 * every time, maps (2D) only when the user asks, and volumes (3D) only with the final results. The request stays
 * until partial results carry the maps, so it is looked up again whenever new partial results come.
 */
export function useOnDemandPages(simulation: FullSimulationData | undefined): OnDemandPages {
	const { authKy } = useAuth();
	const [available, setAvailable] = useState(false);
	const [requested, setRequested] = useState(false);
	const [sending, setSending] = useState(false);

	const jobId = simulation?.jobId;
	const revision = simulation && partialRevision(simulation);
	// partial results of a simulation on the server; a local Geant4 run has none
	const running = revision !== undefined && simulation?.metadata.simType !== 'Geant4';

	useEffect(() => {
		if (!running || !jobId) {
			setAvailable(false);
			setRequested(false);

			return;
		}

		const controller = new AbortController();

		authKy
			.get('results/on_demand', {
				searchParams: { job_id: jobId },
				signal: controller.signal
			})
			.json<OnDemandResponse>()
			.then(response => {
				setAvailable(response.available);
				setRequested(response.requested);
			})
			.catch(error => {
				if (!controller.signal.aborted)
					console.error('Failed to look up the on-demand pages:', error);
			});

		return () => controller.abort();
	}, [authKy, jobId, running, revision]);

	const request = useCallback(async () => {
		if (!jobId) return;
		setSending(true);

		try {
			await authKy.post('results/on_demand', { json: { job_id: jobId } });
			setRequested(true);
		} catch (error) {
			console.error('Failed to ask for the on-demand pages:', error);
		} finally {
			setSending(false);
		}
	}, [authKy, jobId]);

	return { available: running && available, requested, sending, request };
}
