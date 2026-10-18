import { act, renderHook } from '@testing-library/react';

import { StatusState } from '../types/ResponseTypes';
import { StreamedStatus, useSimulationStatusStream, withStatus } from './useSimulationStatusStream';

jest.mock('../config/ConfigService', () => ({
	useConfig: () => ({ backendUrl: 'http://backend' })
}));

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

	test('a submitted simulation no longer shows the busy cluster it waited for, nor its notice', () => {
		const waiting: StreamedStatus = {
			jobId: 'job',
			jobState: StatusState.PENDING,
			clusterBusyUntil: '2026-10-18T12:00:00+00:00',
			clusterNotice: 'Access to the login nodes has been temporarily restricted'
		};
		const submitted = withStatus(waiting, { jobId: 'job', jobState: StatusState.RUNNING });

		expect(submitted.clusterBusyUntil).toBeUndefined();
		expect(submitted.clusterNotice).toBeUndefined();
	});

	test('a final state is kept: a status pushed before it is older', () => {
		const canceled: typeof running = { ...running, jobState: StatusState.CANCELED };

		expect(withStatus(canceled, { jobId: 'job', jobState: StatusState.RUNNING })).toBe(
			canceled
		);
	});
});

describe('useSimulationStatusStream', () => {
	const sources: FakeEventSource[] = [];

	class FakeEventSource {
		static CLOSED = 2;

		readyState = 0;

		onopen?: () => void;

		onmessage?: (event: { data: string }) => void;

		onerror?: () => void;

		constructor() {
			sources.push(this);
		}

		close() {
			this.readyState = FakeEventSource.CLOSED;
		}

		refuse() {
			this.close();
			this.onerror?.();
		}
	}

	beforeEach(() => {
		jest.useFakeTimers();
		sources.length = 0;
		Object.assign(global, { EventSource: FakeEventSource });
	});

	afterEach(() => jest.useRealTimers());

	test('polls after three refusals without the pushed statuses, and goes live again once the stream opens', () => {
		const { result } = renderHook(() => useSimulationStatusStream('user'));
		act(() => {
			sources[0].onopen?.();
			sources[0].onmessage?.({ data: '{"job_id": "job", "job_state": "RUNNING"}' });
		});
		expect(result.current.statuses.job.jobState).toBe(StatusState.RUNNING);

		for (const wait of [1000, 5000, 15000]) {
			act(() => sources[sources.length - 1].refuse());
			act(() => jest.advanceTimersByTime(wait));
		}

		act(() => sources[sources.length - 1].refuse());
		expect(result.current.live).toBe(false);
		expect(result.current.statuses).toEqual({});

		act(() => jest.advanceTimersByTime(60000));
		act(() => sources[sources.length - 1].onopen?.());
		expect(result.current.live).toBe(true);
	});
});
