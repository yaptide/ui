import ky from 'ky';

import { Page } from '../JsRoot/GraphData';
import { snakeToCamelCase } from '../util/Notation/Notation';

/**
 * A result page kept in object storage: the backend sends a signed link instead of the page.
 */
type StoredPage = { pageNumber: number; url: string; format: string };

const isStoredPage = (page: unknown): page is StoredPage =>
	typeof (page as StoredPage | undefined)?.url === 'string';

/**
 * Replaces pages kept in object storage with the pages themselves, fetched in parallel from their signed links.
 * The page JSON goes through the same snake_case to camelCase conversion as the backend's API responses.
 */
export function resolveStoredPages(pages: Page[], signal?: AbortSignal): Promise<Page[]> {
	return Promise.all(
		pages.map(page =>
			isStoredPage(page)
				? ky
						// no timeout: requests beyond the browser's ~6 connections wait in its queue, and a large page
						// on a slow link takes long; the abort signal still stops them
						.get(page.url, { signal, retry: 2, timeout: false })
						.json<object>()
						.then(json => snakeToCamelCase(json, true) as unknown as Page)
				: page
		)
	);
}
