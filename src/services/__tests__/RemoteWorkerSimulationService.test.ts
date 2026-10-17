import { KyInstance } from 'ky';

import RemoteWorkerSimulationService from '../RemoteWorkerSimulationService';

jest.mock('ky', () => ({ get: jest.fn() }));

describe('pages of partial results', () => {
	test('a newer revision drops the pages of the older ones of the same simulation', async () => {
		const ky = {
			get: (url: string) => ({
				json: async () => (url === 'inputs' ? { input: {} } : { pages: [], message: '' })
			})
		} as unknown as KyInstance;
		const service = new RemoteWorkerSimulationService(ky);
		const load = (jobId: string, revision?: number) =>
			service.getEstimatorsPages({
				jobId,
				estimatorName: 'dose',
				pageNumbers: [0],
				revision
			});

		await load('job', 300);
		await load('other', 300);
		await load('job', 600);

		expect(Array.from(service.resultsCache.data.keys())).toEqual([
			'other-dose-0@300',
			'job-dose-0@600'
		]);

		await load('job');

		expect(Array.from(service.resultsCache.data.keys())).toEqual([
			'other-dose-0@300',
			'job-dose-0'
		]);
	});
});
