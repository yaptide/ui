import { Table, tableFromIPC,Vector } from 'apache-arrow';

import { ResponseGetJobPartialResults } from '../types/ResponseTypes';

export function parsePartialResults(buffer: ArrayBuffer): ResponseGetJobPartialResults {
	const table = tableFromIPC(buffer);

	// TODO: Implement this after finding out the exact structure of the Arrow data
	return {
		estimators: [],
		message: 'Partial results'
	};
}
