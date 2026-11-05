import { act, renderHook, waitFor } from '@testing-library/react';
import { KyInstance } from 'ky';

import { BEAT_MS, usePartialResultsWatch } from './usePartialResultsWatch';

const post = jest.fn();
const authKy = { post } as unknown as KyInstance;

function answer(body: unknown) {
	post.mockReturnValueOnce({ json: () => Promise.resolve(body) });
}

const page = {
	estimator: 'Dose',
	file: 'z_dose',
	page_number: 2,
	name: 'XY',
	dimensions: 2,
	requested_at: null,
	merged_at: null,
	primaries: null
};

beforeEach(() => {
	post.mockReset();
	post.mockReturnValue({ json: () => Promise.resolve({ simulations: {} }) });
});

afterEach(() => jest.useRealTimers());

test('beats at once and every BEAT_MS with the unfinished simulations, and reads the maps', async () => {
	jest.useFakeTimers();
	answer({ simulations: { b: { live: true, pages: [page] } } });
	const { result } = renderHook(() =>
		usePartialResultsWatch(authKy, 'http://api', ['b', 'a', 'b'])
	);

	await waitFor(() => expect(result.current.states.b?.live).toBe(true));
	expect(result.current.states.b.pages[0]).toMatchObject({
		file: 'z_dose',
		pageNumber: 2,
		requestedAt: null
	});
	const [path, options] = post.mock.calls[0];
	expect(path).toBe('results/watch');
	expect(options.json.job_ids).toEqual(['a', 'b']);
	expect(options.json.viewer).toBeTruthy();

	await act(async () => {
		jest.advanceTimersByTime(BEAT_MS);
	});
	expect(post).toHaveBeenCalledTimes(2);
	expect(post.mock.calls[1][1].json.viewer).toBe(options.json.viewer);
});

test('does not beat while nothing runs', async () => {
	jest.useFakeTimers();
	renderHook(() => usePartialResultsWatch(authKy, 'http://api', []));

	await act(async () => {
		jest.advanceTimersByTime(3 * BEAT_MS);
	});
	expect(post).not.toHaveBeenCalled();
});

test('says it closes with a beacon on pagehide', async () => {
	const sendBeacon = jest.fn(() => true);
	Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
	renderHook(() => usePartialResultsWatch(authKy, 'http://api', ['a']));
	await waitFor(() => expect(post).toHaveBeenCalled());

	window.dispatchEvent(new Event('pagehide'));

	expect(sendBeacon).toHaveBeenCalledTimes(1);
	const [url, body] = sendBeacon.mock.calls[0] as unknown as [string, Blob];
	expect(url).toBe('http://api/results/watch');
	expect(body.type).toBe('text/plain');
	const sent = JSON.parse(await new Response(body).text());
	expect(sent).toMatchObject({ job_ids: ['a'], closed: true });
});

test('a requested map shows as requested', async () => {
	answer({ simulations: { a: { live: true, pages: [page] } } });
	const { result } = renderHook(() => usePartialResultsWatch(authKy, 'http://api', ['a']));
	await waitFor(() => expect(result.current.states.a).toBeDefined());

	answer({
		live: true,
		available: true,
		pages: [{ ...page, requested_at: '2026-11-05T12:00:00Z' }]
	});
	await act(() => result.current.requestPage('a', 'z_dose', 2));

	expect(post).toHaveBeenLastCalledWith('results/on_demand', {
		json: { job_id: 'a', file: 'z_dose', page_number: 2 }
	});
	expect(result.current.states.a.pages[0].requestedAt).toBe('2026-11-05T12:00:00Z');
});
