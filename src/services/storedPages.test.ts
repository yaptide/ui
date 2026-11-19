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
	it('keeps pages sent inline as they are, without fetching anything', async () => {
		const inline = { dimensions: 0, metadata: { pageNumber: 0 } } as unknown as Page;

		const resolved = await resolveStoredPages([inline]);

		expect(resolved[0]).toBe(inline);
		expect(ky.get).not.toHaveBeenCalled();
	});

	it('reads inline and stored pages of the same estimator together', async () => {
		serve(pages.small_zstd);
		const inline = { dimensions: 1, metadata: { pageNumber: 1 } } as unknown as Page;

		const [first, second] = (await resolveStoredPages([zarrPage, inline])) as unknown as [
			Resolved,
			Page
		];

		expect(first.data.values).toHaveLength(fixtures.small.count);
		expect(second).toBe(inline);
	});

	it('rejects a stored page in a format other than Zarr', async () => {
		const stored = {
			pageNumber: 1,
			url: 'https://storage/p1',
			format: 'page-json-gzip-v1'
		} as unknown as Page;

		await expect(resolveStoredPages([stored])).rejects.toThrow('page-json-gzip-v1');
		expect(ky.get).not.toHaveBeenCalled();
	});

	it('rejects when a link is refused (an expired signature answers 403)', async () => {
		(ky.get as jest.Mock).mockImplementation(() => ({
			json: () => Promise.reject({ response: { status: 403 } }),
			arrayBuffer: () => Promise.reject({ response: { status: 403 } })
		}));

		await expect(resolveStoredPages([zarrPage])).rejects.toEqual({
			response: { status: 403 }
		});
	});

	it('passes the abort signal to every request', async () => {
		serve(pages.small_raw);
		const controller = new AbortController();

		await resolveStoredPages([zarrPage], controller.signal);

		expect(ky.get).toHaveBeenCalledTimes(2);
		(ky.get as jest.Mock).mock.calls.forEach(([, options]) =>
			expect(options).toEqual(expect.objectContaining({ signal: controller.signal }))
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
