import { StatusState } from '../types/ResponseTypes';
import { StreamedStatus, withStatus } from './useSimulationStatusStream';

describe('withStatus', () => {
	const running: StreamedStatus & { title: string } = {
		jobId: 'job',
		title: 'shown',
		jobState: StatusState.RUNNING,
		partialResults: { simulatedPrimaries: 300, time: '2026-10-17T12:00:00+00:00' }
	};

	test('final results replace the partial ones, the rest of the shown data stays', () => {
		const completed = withStatus(running, { jobId: 'job', jobState: StatusState.COMPLETED });

		expect(completed).toEqual({
			jobId: 'job',
			title: 'shown',
			jobState: StatusState.COMPLETED,
			partialResults: undefined
		});
	});

	test('a final state is kept: a status pushed before it is older', () => {
		const canceled: typeof running = { ...running, jobState: StatusState.CANCELED };

		expect(withStatus(canceled, { jobId: 'job', jobState: StatusState.RUNNING })).toBe(
			canceled
		);
	});
});
