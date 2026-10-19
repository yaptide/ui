import { KyInstance } from 'ky';

import { EditorJson } from '../../ThreeEditor/js/EditorJson';
import RemoteWorkerSimulationService, {
	recreateRefsInResults
} from '../RemoteWorkerSimulationService';

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

describe('full resolution results', () => {
	const load = (page: object) => {
		const ky = {
			get: (url: string) => ({
				json: async () =>
					url === 'inputs' ? { input: {} } : { pages: [], message: '', ...page }
			})
		} as unknown as KyInstance;

		return new RemoteWorkerSimulationService(ky).getEstimatorsPages({
			jobId: 'job',
			estimatorName: 'XZ_map_',
			pageNumbers: [0]
		});
	};

	test.each([
		{ fullResolution: true },
		{ fullResolutionUrl: 'https://storage/XZ_map.bdo?sig=1' }
	])('keep the name to ask the backend for them by, not a signed link (%p)', async page => {
		const [estimator] = (await load(page))!.estimators;

		expect(estimator).toMatchObject({ name: 'XZ_map', fullResolutionName: 'XZ_map_' });
		expect(JSON.stringify(estimator)).not.toContain('storage');
	});

	test('are not offered when the backend has none', async () => {
		const [estimator] = (await load({}))!.estimators;

		expect(estimator.fullResolutionName).toBeUndefined();
	});
});

describe('results of the editor outputs', () => {
	const output = (uuid: string, name: string) => ({ uuid, name, quantities: [] });
	const inputJson = {
		scoringManager: {
			outputs: [output('a', 'dose'), output('b', 'dose'), output('c', 'fluence')],
			filters: []
		}
	} as unknown as EditorJson;

	test('estimators in any order get the outputs they were scored by', () => {
		const estimators = recreateRefsInResults(inputJson, [
			{ name: 'fluence', outputUuid: 'c', pages: [] },
			{ name: 'dose', outputUuid: 'b', pages: [] },
			{ name: 'dose', outputUuid: 'a', pages: [] }
		]);

		expect(estimators.map(estimator => estimator.scoringOutputJsonRef?.uuid)).toEqual([
			'c',
			'b',
			'a'
		]);
	});

	test('results without output uuids are matched by name, and a mismatch is reported', () => {
		const error = jest.spyOn(console, 'error').mockImplementation(() => {});

		const estimators = recreateRefsInResults(inputJson, [
			{ name: 'other', pages: [] },
			{ name: 'fluence', pages: [] }
		]);

		expect(estimators.map(estimator => estimator.scoringOutputJsonRef?.uuid)).toEqual([
			undefined,
			'c'
		]);
		expect(error).toHaveBeenCalledWith('Estimator other matches no output of the simulation');
		error.mockRestore();
	});
});
