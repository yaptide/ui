import { formatDistance } from 'date-fns';

import { JobTasksSummary, PartialResults, StatusState } from '../types/ResponseTypes';

type WithPartialResults = {
	jobState?: StatusState;
	jobTasksSummary?: JobTasksSummary;
	partialResults?: PartialResults;
};

/**
 * Primaries the stored results cover while the simulation has not completed; undefined for final results.
 */
export function partialRevision(status: WithPartialResults): number | undefined {
	return status.jobState === StatusState.COMPLETED
		? undefined
		: status.partialResults?.simulatedPrimaries;
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
