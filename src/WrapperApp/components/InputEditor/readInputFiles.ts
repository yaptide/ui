import { strFromU8, unzipSync } from 'fflate';

import { InputFiles } from './simulatorDetection';

export type ReadInputFiles = {
	files: InputFiles;
	skipped: string[];
};

const isZip = (name: string) => /\.zip$/i.test(name);

const isBinary = (content: string) => content.includes('\u0000');

const baseName = (path: string) => path.split('/').pop() ?? path;

const isArchiveMetadata = (path: string) =>
	path.endsWith('/') || path.startsWith('__MACOSX/') || baseName(path).startsWith('._');

function unzipTextFiles(zipName: string, bytes: Uint8Array, result: ReadInputFiles) {
	const entries = unzipSync(bytes, { filter: entry => !isArchiveMetadata(entry.name) });

	for (const [path, content] of Object.entries(entries)) {
		const text = strFromU8(content);

		if (isBinary(text)) result.skipped.push(`${zipName}/${path}`);
		else result.files[baseName(path)] = text;
	}
}

export async function readInputFiles(files: File[]): Promise<ReadInputFiles> {
	const result: ReadInputFiles = { files: {}, skipped: [] };

	for (const file of files) {
		const bytes = new Uint8Array(await file.arrayBuffer());

		if (isZip(file.name)) {
			try {
				unzipTextFiles(file.name, bytes, result);
			} catch {
				result.skipped.push(file.name);
			}

			continue;
		}

		const text = strFromU8(bytes);

		if (isBinary(text)) result.skipped.push(file.name);
		else result.files[file.name] = text;
	}

	return result;
}
