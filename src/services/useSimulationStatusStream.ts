import { useEffect, useMemo, useState } from 'react';

import { useConfig } from '../config/ConfigService';
import { JobUnknownStatus, StatusState } from '../types/ResponseTypes';
import { snakeToCamelCase } from '../util/Notation/Notation';

export type StreamedStatus = JobUnknownStatus & { jobId: string };

export interface SimulationStatusStream {
	// the latest status pushed for each simulation, by job id
	statuses: Record<string, StreamedStatus>;
	// false once the stream was refused too often: statuses are polled instead
	live: boolean;
	// counts the (re)openings; a simulation that finished while the stream was closed is not sent again
	opened: number;
}

const FINAL_STATES = new Set([StatusState.COMPLETED, StatusState.FAILED, StatusState.CANCELED]);

/**
 * The pushed status in place of the held one; final results come without partial results. A final state never
 * changes, so a status pushed before it is older and is not applied.
 */
export function withStatus<T extends JobUnknownStatus>(
	data: T,
	status: StreamedStatus | undefined
): T {
	if (!status || (data.jobState && FINAL_STATES.has(data.jobState))) return data;

	return { ...data, partialResults: undefined, ...status };
}

// waits before opening a refused stream again (e.g. an expired token, refreshed meanwhile); then polling takes over
const REOPEN_MS = [1000, 5000, 15000];

/**
 * One stream per logged in session with the status of all the user's unfinished simulations (server-sent events),
 * sent when one is submitted, its state or partial results change, or its tasks report progress.
 */
export function useSimulationStatusStream(enabled: boolean): SimulationStatusStream {
	const { backendUrl } = useConfig();
	const [statuses, setStatuses] = useState<Record<string, StreamedStatus>>({});
	const [live, setLive] = useState(true);
	const [opened, setOpened] = useState(0);

	useEffect(() => {
		setStatuses({});
		setLive(true);

		if (!enabled) return;
		let source: EventSource | undefined;
		let reopen: ReturnType<typeof setTimeout> | undefined;
		let refusals = 0;

		const open = () => {
			source = new EventSource(`${backendUrl}/events/simulations`, {
				withCredentials: true
			});

			source.onopen = () => {
				refusals = 0;
				setOpened(count => count + 1);
			};

			source.onmessage = event => {
				const status = snakeToCamelCase(
					JSON.parse(event.data) as object,
					true
				) as StreamedStatus;
				setStatuses(prev => ({ ...prev, [status.jobId]: status }));
			};

			source.onerror = () => {
				// the browser reconnects a dropped stream itself, a refused one stays closed
				if (source?.readyState !== EventSource.CLOSED) return;

				if (refusals === REOPEN_MS.length) setLive(false);
				else reopen = setTimeout(open, REOPEN_MS[refusals++]);
			};
		};
		open();

		return () => {
			clearTimeout(reopen);
			source?.close();
		};
	}, [enabled, backendUrl]);

	return useMemo(() => ({ statuses, live, opened }), [statuses, live, opened]);
}
