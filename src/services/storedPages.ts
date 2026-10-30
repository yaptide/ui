import { decompress as zstdDecompress } from 'fzstd';
import ky from 'ky';

import { Page } from '../JsRoot/GraphData';
import { snakeToCamelCase } from '../util/Notation/Notation';
import { gunzip } from './gunzip';

/**
 * A result page kept in object storage: the backend sends a signed link instead of the page.
 * A page in ZARR_FORMAT also comes with a link for each of its objects (zarr.json and the shard c/0).
 */
type StoredPage = {
	pageNumber: number;
	url: string;
	format: string;
	files?: Record<string, string>;
};

export const ZARR_FORMAT = 'zarr-v3';
const METADATA_FILE = 'zarr.json';
const SHARD_FILE = 'c/0';
const ITEM_SIZE = 4;
// a chunk left out of a shard (all zeros): its offset and size in the shard's index
const EMPTY = BigInt('0xffffffffffffffff');

type Codec = { name: string; configuration?: Record<string, unknown> };
type ZarrMetadata = {
	shape: number[];
	data_type: string;
	chunk_grid: { configuration: { chunk_shape: number[] } };
	codecs: { name: string; configuration: { chunk_shape: number[]; codecs: Codec[] } }[];
	attributes: { yaptide_page: object };
};

const isStoredPage = (page: unknown): page is StoredPage =>
	typeof (page as StoredPage | undefined)?.url === 'string';

/**
 * The values of a page's shard (the backend's yaptide/batch/result_format.py): its chunks, each raw, zstd or gzip
 * compressed, then an index of (offset, size) per chunk at its end; a chunk left out holds zeros
 */
export async function shardValues(
	meta: ZarrMetadata,
	shard: ArrayBuffer | undefined
): Promise<Float32Array> {
	const count = meta.shape[0];
	const values = new Float32Array(count);

	if (!count || !shard) return values;

	if (meta.data_type !== 'float32')
		throw new Error(`Unexpected page data type ${meta.data_type}`);
	const config = meta.codecs[0].configuration;
	const inner = config.chunk_shape[0];
	const names = config.codecs.map(codec => codec.name);
	const decode = names.includes('zstd')
		? async (chunk: Uint8Array) => zstdDecompress(chunk)
		: names.includes('gzip')
			? gunzip
			: async (chunk: Uint8Array) => chunk;
	const chunks = Math.ceil(meta.chunk_grid.configuration.chunk_shape[0] / inner);
	const index = new DataView(shard, shard.byteLength - 16 * chunks);
	const bytes = new Uint8Array(values.buffer);

	for (let number = 0; number < chunks; number++) {
		const offset = index.getBigUint64(16 * number, true);
		const size = index.getBigUint64(16 * number + 8, true);

		if (offset === EMPTY) continue;
		const chunk = await decode(new Uint8Array(shard, Number(offset), Number(size)));
		const start = number * inner * ITEM_SIZE;
		// the last chunk reaches past the end of the values, filled up with zeros
		bytes.set(
			chunk.subarray(0, Math.max(0, Math.min(chunk.length, bytes.length - start))),
			start
		);
	}

	// float32 is little-endian in the shard, as in every browser's typed arrays
	return values;
}

/**
 * A page in ZARR_FORMAT as the JSON pages had it: the page from zarr.json's attributes, its values from the shard
 */
async function zarrPage(page: StoredPage, signal?: AbortSignal): Promise<Page> {
	const files = page.files ?? {};
	const metaUrl = files[METADATA_FILE] ?? page.url;
	const [meta, shard] = await Promise.all([
		ky.get(metaUrl, { signal, retry: 2, timeout: false }).json<ZarrMetadata>(),
		files[SHARD_FILE]
			? ky
					.get(files[SHARD_FILE], { signal, retry: 2, timeout: false })
					.arrayBuffer()
					// a page without values has no shard: its link answers 404
					.catch((error: { response?: { status: number } }) => {
						if (error?.response?.status === 404) return undefined;

						throw error;
					})
			: Promise.resolve(undefined)
	]);
	const values = await shardValues(meta, shard);
	// the keys of the page itself only: its values are a long array of numbers
	const converted = snakeToCamelCase(meta.attributes.yaptide_page, true) as unknown as {
		data?: Record<string, unknown>;
	};

	return {
		...converted,
		data: { ...converted.data, values: Array.from(values) }
	} as unknown as Page;
}

/**
 * Replaces pages kept in object storage with the pages themselves, fetched in parallel from their signed links.
 * The page JSON goes through the same snake_case to camelCase conversion as the backend's API responses.
 */
export function resolveStoredPages(pages: Page[], signal?: AbortSignal): Promise<Page[]> {
	return Promise.all(
		pages.map(page =>
			isStoredPage(page)
				? page.format === ZARR_FORMAT
					? zarrPage(page, signal)
					: ky
							// no timeout: requests beyond the browser's ~6 connections wait in its queue, and a large
							// page on a slow link takes long; the abort signal still stops them
							.get(page.url, { signal, retry: 2, timeout: false })
							.json<object>()
							.then(json => snakeToCamelCase(json, true) as unknown as Page)
				: page
		)
	);
}
