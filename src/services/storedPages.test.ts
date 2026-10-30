import ky from 'ky';

import { Page } from '../JsRoot/GraphData';
import fixtures from './__fixtures__/zarrPages.json';
import { resolveStoredPages, ZARR_FORMAT } from './storedPages';

jest.mock('ky', () => ({ get: jest.fn() }));
// jsdom has no DecompressionStream: Node's zlib in its place for the gzip pages
jest.mock('./gunzip', () => ({
	gunzip: async (data: Uint8Array) => Uint8Array.from(jest.requireActual('zlib').gunzipSync(data))
}));

// pages written by the backend's yaptide/batch/result_format.py: zstd (the backend's merges), gzip (a cluster's
// merge without zstandard) and raw; "sparse" has a first chunk of zeros left out of its shard and a short last chunk
type Fixture = Record<string, string>;
const pages = fixtures.pages as Record<string, Fixture>;
const bytes = (base64: string) => Uint8Array.from(Buffer.from(base64, 'base64'));

function serve(fixture: Fixture | undefined) {
	(ky.get as jest.Mock).mockImplementation((url: string) => {
		const name = url.split('/').pop() === 'zarr.json' ? 'zarr.json' : 'c/0';
		const body = fixture?.[name];

		return {
			json: () => Promise.resolve(JSON.parse(Buffer.from(body!, 'base64').toString())),
			arrayBuffer: () =>
				body === undefined
					? Promise.reject({ response: { status: 404 } })
					: Promise.resolve(bytes(body).slice().buffer)
		};
	});
}

const zarrPage = {
	pageNumber: 0,
	url: 'https://storage/p0/zarr.json',
	format: ZARR_FORMAT,
	files: { 'zarr.json': 'https://storage/p0/zarr.json', 'c/0': 'https://storage/p0/c/0' }
} as unknown as Page;

type Resolved = {
	name: string;
	axisDim1: { values: number[] };
	data: { unit: string; values: number[] };
};

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

		const resolved = await resolveStoredPages([inline, stored]);

		expect(resolved[0]).toBe(inline);
		expect(resolved[1]).toEqual({ metadata: { pageNumber: 1 }, axisDim1: { values: [1] } });
		expect(ky.get).toHaveBeenCalledWith(
			'https://storage/p1',
			expect.objectContaining({ retry: 2 })
		);
	});

	it.each(['small_zstd', 'small_gzip', 'small_raw'])(
		'reads a Zarr page (%s) as the JSON page it was: the page from zarr.json, the values from the shard',
		async name => {
			serve(pages[name]);

			const [page] = (await resolveStoredPages([zarrPage])) as unknown as Resolved[];

			expect(page.name).toBe('dose_map');
			expect(page.axisDim1.values).toEqual([0.5, 1.5]);
			expect(page.data.unit).toBe('Gy');
			expect(page.data.values).toHaveLength(fixtures.small.count);
			expect(page.data.values.slice(0, 10)).toEqual(fixtures.small.head);
		}
	);

	it.each(['sparse_zstd', 'sparse_gzip'])(
		'fills chunks left out of the shard (%s) with zeros and cuts the last chunk at the end of the values',
		async name => {
			serve(pages[name]);

			const [page] = (await resolveStoredPages([zarrPage])) as unknown as Resolved[];
			const values = page.data.values;

			expect(values).toHaveLength(fixtures.count);
			expect(values.slice(0, fixtures.zeros).every(value => value === 0)).toBe(true);
			expect(values.slice(fixtures.zeros, fixtures.zeros + 14)).toEqual(fixtures.values_tail);
		}
	);

	it('reads a page without a shard (its link answers 404) as zeros', async () => {
		serve({ 'zarr.json': pages.small_raw['zarr.json'] });

		const [page] = (await resolveStoredPages([zarrPage])) as unknown as Resolved[];

		expect(page.data.values).toEqual(new Array(fixtures.small.count).fill(0));
	});
});
