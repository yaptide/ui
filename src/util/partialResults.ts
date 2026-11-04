import { formatDistance } from 'date-fns';

import { JobTasksSummary, PartialResults, StatusState } from '../types/ResponseTypes';

type WithPartialResults = {
	jobState?: StatusState;
	jobTasksSummary?: JobTasksSummary;
	partialResults?: PartialResults;
};

/**
 * Which partial results are stored while the simulation has not completed: when they were stored (in ms), so the
 * on-demand 2D results, merged apart from the live ones and often from the same primaries, count as new results too;
 * the primaries when the time is missing. Undefined for final results.
 */
export function partialRevision(status: WithPartialResults): number | undefined {
	if (status.jobState === StatusState.COMPLETED || !status.partialResults) return undefined;
	const stored = Date.parse(status.partialResults.time);

	return Number.isNaN(stored) ? status.partialResults.simulatedPrimaries : stored;
}

/**
 * What partial results are based on, e.g. "37% of primaries, 2 minutes ago".
 */
export function partialResultsLabel(
	status: WithPartialResults,
	now = new Date()
): string | undefined {
	const partial = status.partialResults;

	if (partialRevision(status) === undefined || !partial) return undefined;
	const requested = status.jobTasksSummary?.requestedPrimaries;
	const share = requested
		? `${Math.floor((100 * partial.simulatedPrimaries) / requested)}% of primaries`
		: `${partial.simulatedPrimaries} primaries`;

	return `${share}, ${formatDistance(new Date(partial.time), now, { addSuffix: true })}`;
}
