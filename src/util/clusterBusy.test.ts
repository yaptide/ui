import { clusterBusyLabel } from './clusterBusy';

describe('clusterBusyLabel', () => {
	const until = '2026-10-18T12:05:00+00:00';

	it('says when the busy cluster is tried again', () => {
		const label = clusterBusyLabel(
			{ clusterBusyUntil: until },
			new Date('2026-10-18T12:00:00Z')
		);

		expect(label).toMatch(/^Cluster busy, trying again at \d\d:\d\d$/);
	});

	it('says it is tried now once that time passed', () => {
		expect(
			clusterBusyLabel({ clusterBusyUntil: until }, new Date('2026-10-18T12:06:00Z'))
		).toBe('Cluster busy, trying again now');
	});

	it('says nothing for a simulation not waiting for its cluster', () => {
		expect(clusterBusyLabel({})).toBeUndefined();
	});
});
