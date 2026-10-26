import { StatusState } from '../types/ResponseTypes';
import { partialResultsLabel, partialRevision } from './partialResults';

const running = {
	jobState: StatusState.RUNNING,
	jobTasksSummary: {
		ntasks: 2,
		taskStates: { [StatusState.RUNNING]: 2 },
		requestedPrimaries: 8000,
		simulatedPrimaries: 3500
	},
	partialResults: { simulatedPrimaries: 3000, time: '2026-10-17T12:00:00+00:00' }
};

describe('partial results', () => {
	it('says what the results cover and how old they are', () => {
		expect(partialResultsLabel(running, new Date('2026-10-17T12:02:00Z'))).toBe(
			'37% of primaries, 2 minutes ago'
		);
	});

	it('treats the results of a completed simulation as final', () => {
		const completed = { ...running, jobState: StatusState.COMPLETED };

		expect(partialRevision(running)).toBe(3000);
		expect(partialRevision(completed)).toBeUndefined();
		expect(partialResultsLabel(completed)).toBeUndefined();
	});
});
