import { act, renderHook, waitFor } from '@testing-library/react';

import { StatusState } from '../../../types/ResponseTypes';
import { FullSimulationData } from '../../../types/SimulationService';
import { useOnDemandPages } from './useOnDemandPages';

const mockAuthKy = { get: jest.fn(), post: jest.fn() };
const get = mockAuthKy.get;
const post = mockAuthKy.post;

jest.mock('../../../services/AuthService', () => ({
	useAuth: () => ({ authKy: mockAuthKy })
}));

function simulation(
	jobState: StatusState,
	simulatedPrimaries = 100,
	simType = 'shieldhit'
): FullSimulationData {
	return {
		jobId: 'job',
		jobState,
		// the time names the partial results (partialRevision): newer primaries, a later time
		partialResults: {
			simulatedPrimaries,
			time: new Date(Date.UTC(2026, 10, 4) + simulatedPrimaries * 1000).toISOString()
		},
		metadata: { simType }
	} as unknown as FullSimulationData;
}

function answers(...responses: { requested: boolean; available: boolean }[]) {
	for (const response of responses)
		get.mockReturnValueOnce({ json: () => Promise.resolve(response) });
}

beforeEach(() => {
	get.mockReset();
	post.mockReset();
});

test('asks the server for the 2D pages of a running simulation', async () => {
	answers({ requested: false, available: true });
	post.mockResolvedValue({});
	const { result } = renderHook(() => useOnDemandPages(simulation(StatusState.RUNNING)));

	await waitFor(() => expect(result.current.available).toBe(true));
	expect(result.current.requested).toBe(false);

	await act(() => result.current.request());

	expect(post).toHaveBeenCalledWith('results/on_demand', { json: { job_id: 'job' } });
	expect(result.current.requested).toBe(true);
});

test('looks the request up again when new partial results come', async () => {
	answers({ requested: true, available: true }, { requested: false, available: true });
	const { result, rerender } = renderHook(props => useOnDemandPages(props), {
		initialProps: simulation(StatusState.RUNNING, 100)
	});

	await waitFor(() => expect(result.current.requested).toBe(true));
	rerender(simulation(StatusState.RUNNING, 200));
	await waitFor(() => expect(result.current.requested).toBe(false));
	expect(get).toHaveBeenCalledTimes(2);
});

test('offers nothing for final results, a local Geant4 run or a server without storage', async () => {
	const { result: completed } = renderHook(() =>
		useOnDemandPages(simulation(StatusState.COMPLETED))
	);

	const { result: geant4 } = renderHook(() =>
		useOnDemandPages(simulation(StatusState.RUNNING, 100, 'Geant4'))
	);

	expect(completed.current.available).toBe(false);
	expect(geant4.current.available).toBe(false);
	expect(get).not.toHaveBeenCalled();

	answers({ requested: false, available: false });
	const { result: noStorage } = renderHook(() =>
		useOnDemandPages(simulation(StatusState.RUNNING))
	);

	await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
	expect(noStorage.current.available).toBe(false);
});
