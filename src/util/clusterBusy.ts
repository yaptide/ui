import { format } from 'date-fns';

/**
 * What a simulation waiting for its HPC cluster tells the user, e.g. "Cluster busy, trying again at 14:05";
 * undefined when it does not wait for one.
 */
export function clusterBusyLabel(
	status: { clusterBusyUntil?: string },
	now = new Date()
): string | undefined {
	if (!status.clusterBusyUntil) return undefined;
	const until = new Date(status.clusterBusyUntil);

	return until > now
		? `Cluster busy, trying again at ${format(until, 'HH:mm')}`
		: 'Cluster busy, trying again now';
}
