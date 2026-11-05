import { KyInstance } from 'ky';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { snakeToCamelCase } from '../util/Notation/Notation';

/** A map of a running simulation, merged only when the user asks for that page */
export type PartialPage = {
	// the estimator as the results name it, and its result file (what a request names)
	estimator: string;
	file: string;
	pageNumber: number;
	name: string;
	dimensions: number;
	// ISO times: asked for and not merged yet, and the last merge
	requestedAt: string | null;
	mergedAt: string | null;
	primaries: number | null;
};

/** What the server says of a running simulation's partial results besides the pages */
export type PartialState = {
	// the live (0D and 1D) pages are merged now: someone has the app open
	live: boolean;
	pages: PartialPage[];
};

export type PartialResultsWatch = {
	// by job id, the running simulations named in the last beat
	states: Record<string, PartialState>;
	// asks for one map of a running simulation; resolves once the server noted it
	requestPage: (jobId: string, file: string, pageNumber: number) => Promise<void>;
};

// a beat this often while the app is open; the server counts a tab as gone a minute after its last beat
export const BEAT_MS = 15000;

function newViewerId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();

	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function parseStates(content: unknown): Record<string, PartialState> {
	const simulations = (content as { simulations?: Record<string, unknown> })?.simulations ?? {};

	return Object.fromEntries(
		Object.entries(simulations).map(([jobId, state]) => [
			jobId,
			snakeToCamelCase(state as object, true) as unknown as PartialState
		])
	);
}

/**
 * Partial results are merged on the server only while someone looks at them: while the app is open, this tab beats
 * every BEAT_MS naming the user's unfinished simulations, so their 0D and 1D pages are merged live, and says when
 * it closes (a beacon on pagehide, which a closing page still sends). A map (2D page) is merged only when asked for,
 * that page alone; the beat answers which maps there are, when each was asked for and last merged.
 */
export function usePartialResultsWatch(
	authKy: KyInstance,
	backendUrl: string,
	jobIds: string[]
): PartialResultsWatch {
	const viewer = useRef(newViewerId()).current;
	const [states, setStates] = useState<Record<string, PartialState>>({});
	// the same list in another order, or another array of the same ids, is the same beat
	const key = useMemo(() => Array.from(new Set(jobIds)).sort().join(','), [jobIds]);
	const watched = useRef<string[]>([]);
	watched.current = key ? key.split(',') : [];

	const beat = useCallback(async () => {
		const ids = watched.current;

		if (!ids.length) {
			setStates({});

			return;
		}

		try {
			const response = await authKy
				.post('results/watch', { json: { job_ids: ids, viewer } })
				.json<unknown>();
			setStates(parseStates(response));
		} catch (error) {
			console.error('Failed to tell the server the results are open:', error);
		}
	}, [authKy, viewer]);

	useEffect(() => {
		beat();
		const timer = setInterval(beat, BEAT_MS);

		return () => clearInterval(timer);
	}, [beat, key]);

	useEffect(() => {
		const close = () => {
			const ids = watched.current;

			if (!ids.length || typeof navigator === 'undefined' || !navigator.sendBeacon) return;
			// text/plain: a beacon of any other type would need a preflight, which a closing page does not wait for
			const body = new Blob([JSON.stringify({ job_ids: ids, viewer, closed: true })], {
				type: 'text/plain'
			});
			navigator.sendBeacon(`${backendUrl}/results/watch`, body);
		};

		window.addEventListener('pagehide', close);

		return () => {
			window.removeEventListener('pagehide', close);
			// logged out, or another user: these simulations are no longer looked at from here
			close();
		};
	}, [backendUrl, viewer]);

	const requestPage = useCallback(
		async (jobId: string, file: string, pageNumber: number) => {
			const response = await authKy
				.post('results/on_demand', {
					json: { job_id: jobId, file, page_number: pageNumber }
				})
				.json<unknown>();

			const state = snakeToCamelCase(
				response as object,
				true
			) as unknown as Partial<PartialState>;

			if (state?.pages)
				setStates(previous => ({
					...previous,
					[jobId]: {
						live: state.live ?? previous[jobId]?.live ?? false,
						pages: state.pages!
					}
				}));
		},
		[authKy]
	);

	return useMemo(() => ({ states, requestPage }), [states, requestPage]);
}
