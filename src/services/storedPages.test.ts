import ky from 'ky';

import { Page } from '../JsRoot/GraphData';
import { resolveStoredPages } from './storedPages';

jest.mock('ky', () => ({ get: jest.fn() }));

describe('resolveStoredPages', () => {
	it('fetches pages kept in storage and converts their keys, keeping pages sent inline', async () => {
		(ky.get as jest.Mock).mockReturnValue({
			json: () =>
				Promise.resolve({ metadata: { page_number: 1 }, axis_dim1: { values: [1] } })
		});
		const inline = { dimensions: 0, metadata: { pageNumber: 0 } } as unknown as Page;
		const stored = {
			pageNumber: 1,
			url: 'https://storage/p1',
			format: 'page-json-gzip-v1'
		} as unknown as Page;

		const pages = await resolveStoredPages([inline, stored]);

		expect(pages[0]).toBe(inline);
		expect(pages[1]).toEqual({ metadata: { pageNumber: 1 }, axisDim1: { values: [1] } });
		expect(ky.get).toHaveBeenCalledWith(
			'https://storage/p1',
			expect.objectContaining({ retry: 2 })
		);
	});
});
