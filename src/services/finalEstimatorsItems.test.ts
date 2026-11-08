import { KyInstance } from 'ky';

import { StatusState } from '../types/ResponseTypes';
import RemoteWorkerSimulationService from './RemoteWorkerSimulationService';

jest.mock('ky', () => ({ HTTPError: class HTTPError extends Error {} }));

const metadata = (...names: string[]) => ({
	estimatorsMetadata: names.map(name => ({
		name,
		pagesMetadata: [
			{ pageDimension: name.startsWith('yz') ? 2 : 1, pageName: 'Dose', pageNumber: 0 }
		]
	}))
});

test('the estimators listed while the simulation ran are read again once it completed', async () => {
	const service = new RemoteWorkerSimulationService({} as KyInstance);
	const inputs = { input: {} } as any;
	const current = jest
		.spyOn(service as any, 'getCurrentEstimators')
		.mockResolvedValueOnce(metadata('z_profile'))
		.mockResolvedValueOnce(metadata('yz_profile', 'z_profile'));

	const find = (status: object) =>
		(service as any).findEstimatorsNamesAndPages({ jobId: 'job', ...status }, inputs);

	// partial results: the maps no one asked for are not listed
	await find({
		jobState: StatusState.RUNNING,
		partialResults: { time: '2026-11-08T14:00:00Z', simulatedPrimaries: 10 }
	});
	expect(inputs.input.estimatorsItems.map((e: any) => e.name)).toEqual(['z_profile']);

	await find({ jobState: StatusState.COMPLETED });
	expect(inputs.input.estimatorsItems.map((e: any) => e.name)).toEqual([
		'yz_profile',
		'z_profile'
	]);

	// the final list stays
	await find({ jobState: StatusState.COMPLETED });
	expect(current).toHaveBeenCalledTimes(2);
});
