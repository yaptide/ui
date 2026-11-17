import { KyInstance } from 'ky';

import { StatusState } from '../../types/ResponseTypes';
import RemoteWorkerSimulationService from '../RemoteWorkerSimulationService';
import { resolveStoredPages } from '../storedPages';

jest.mock('../storedPages', () => ({ resolveStoredPages: jest.fn() }));

type Request = { url: string; searchParams?: Record<string, string> | URLSearchParams };

/** A backend with one estimator whose pages are listed by dimension, answering every request it gets */
function backend(pagesMetadata: { pageDimension: number; pageName: string; pageNumber: number }[]) {
	const requests: Request[] = [];
	const ky = {
		get: (url: string, options: { searchParams?: Request['searchParams'] } = {}) => {
			requests.push({ url, searchParams: options.searchParams });
			const body = (() => {
				switch (url) {
					case 'inputs':
						return { input: {}, message: '' };
					case 'estimators':
						return { estimatorsMetadata: [{ name: 'dose', pagesMetadata }] };

					case 'results': {
						const params = options.searchParams as URLSearchParams | undefined;
						const numbers = params?.get?.('page_numbers') ?? '';

						return {
							message: '',
							estimators: [],
							// "2-3,5" style ranges
							pages: numbers
								.split(',')
								.filter(Boolean)
								.flatMap(range => {
									const [start, end = start] = range.split('-').map(Number);

									return Array.from(
										{ length: end - start + 1 },
										(_, i) => start + i
									);
								})
								.map(pageNumber => ({ metadata: { pageNumber } }))
						};
					}

					default:
						return {};
				}
			})();

			return { json: async () => body };
		}
	} as unknown as KyInstance;

	return { service: new RemoteWorkerSimulationService(ky), requests };
}

const completed = { jobId: 'job', jobState: StatusState.COMPLETED } as never;

const pageRequests = (requests: Request[]) =>
	requests
		.filter(request => request.url === 'results')
		.map(request => (request.searchParams as URLSearchParams).get('page_numbers'));

describe('pages loaded with a simulation', () => {
	// inline pages: the reader gives them back as they are
	beforeEach(() =>
		(resolveStoredPages as jest.Mock).mockImplementation(async (pages: unknown[]) => pages)
	);

	test('only the 0D and 1D pages load with the first estimator; 2D and 3D wait until shown', async () => {
		const { service, requests } = backend([
			{ pageDimension: 0, pageName: 'Dose', pageNumber: 0 },
			{ pageDimension: 1, pageName: 'Depth dose', pageNumber: 1 },
			{ pageDimension: 2, pageName: 'Dose map', pageNumber: 2 },
			{ pageDimension: 3, pageName: 'Volume', pageNumber: 3 }
		]);

		const data = await service.getFullSimulationData(completed);

		expect(pageRequests(requests)).toEqual(['0', '1']);
		expect(data?.estimators.map(estimator => estimator.name)).toEqual(['dose']);
		expect(data?.estimators[0].pages).toHaveLength(2);
	});

	test('an estimator of maps only still comes, with no pages yet', async () => {
		const { service, requests } = backend([
			{ pageDimension: 2, pageName: 'yz profile', pageNumber: 0 }
		]);

		const data = await service.getFullSimulationData(completed);

		expect(pageRequests(requests)).toEqual([]);
		expect(data?.estimators).toEqual([{ name: 'dose', pages: [] }]);
	});

	test('pages of an estimator go through the stored pages reader', async () => {
		const { service } = backend([]);
		const controller = new AbortController();

		await service.getEstimatorsPages(
			{ jobId: 'job', estimatorName: 'dose', pageNumbers: [2, 3] },
			controller.signal
		);

		expect(resolveStoredPages).toHaveBeenCalledWith(
			[{ metadata: { pageNumber: 2 } }, { metadata: { pageNumber: 3 } }],
			controller.signal
		);
	});
});
