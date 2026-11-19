import { unzipSync } from 'fflate';

import { InputFiles } from './simulatorDetection';

export type ReadInputFiles = {
	files: InputFiles;
	skipped: string[];
	duplicates: string[];
	notUtf8: string[];
};

const isZip = (name: string) => /\.zip$/i.test(name);

const isBinary = (content: string) => content.includes('\u0000');

const baseName = (path: string) => path.split('/').pop() ?? path;

const isArchiveMetadata = (path: string) =>
	path.endsWith('/') || path.startsWith('__MACOSX/') || baseName(path).startsWith('._');

const strictUtf8 = new TextDecoder('utf-8', { fatal: true });
const lenientUtf8 = new TextDecoder('utf-8');

function decode(bytes: Uint8Array) {
	try {
		return { text: strictUtf8.decode(bytes), utf8: true };
	} catch {
		return { text: lenientUtf8.decode(bytes), utf8: false };
	}
}

function addTextFile(result: ReadInputFiles, name: string, source: string, bytes: Uint8Array) {
	const { text, utf8 } = decode(bytes);

	if (isBinary(text)) {
		result.skipped.push(source);

		return;
	}

	if (!utf8) result.notUtf8.push(source);
	if (name in result.files && !result.duplicates.includes(name)) result.duplicates.push(name);
	result.files[name] = text;
}

function unzipTextFiles(zipName: string, bytes: Uint8Array, result: ReadInputFiles) {
	const entries = unzipSync(bytes, { filter: entry => !isArchiveMetadata(entry.name) });

	for (const [path, content] of Object.entries(entries))
		addTextFile(result, baseName(path), `${zipName}/${path}`, content);
}

export async function readInputFiles(files: File[]): Promise<ReadInputFiles> {
	const result: ReadInputFiles = { files: {}, skipped: [], duplicates: [], notUtf8: [] };

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

		addTextFile(result, file.name, file.name, bytes);
	}

	return result;
}

export function readInputFilesWarnings({ skipped, duplicates, notUtf8 }: ReadInputFiles) {
	return [
		skipped.length > 0 && `Skipped files that are not text: ${skipped.join(', ')}.`,
		duplicates.length > 0 &&
			`Several files have the same name, only the last one was kept: ${duplicates.join(', ')}.`,
		notUtf8.length > 0 &&
			`Characters that are not UTF-8 were replaced with � in: ${notUtf8.join(', ')}.`
	].filter((warning): warning is string => typeof warning === 'string');
}
