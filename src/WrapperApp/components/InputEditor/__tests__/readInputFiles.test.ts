import { strToU8, zipSync } from 'fflate';

import { readInputFiles } from '../readInputFiles';

const file = (name: string, bytes: Uint8Array) =>
	({ name, arrayBuffer: async () => bytes.buffer }) as unknown as File;

describe('readInputFiles', () => {
	test('reads text files', async () => {
		expect(
			await readInputFiles([
				file('fl_sim.inp', strToU8('START 1.0\n')),
				file('Mój plik.dat', strToU8('zażółć'))
			])
		).toEqual({
			files: { 'fl_sim.inp': 'START 1.0\n', 'Mój plik.dat': 'zażółć' },
			skipped: []
		});
	});

	test('unpacks zip files, flattening folders and skipping archive metadata', async () => {
		const zipped = zipSync({
			'beam.dat': strToU8('NSTAT 10 0'),
			'project/geo.dat': strToU8('geo'),
			'__MACOSX/project/._geo.dat': new Uint8Array([0, 5, 22, 7]),
			'project/._mat.dat': new Uint8Array([0, 5, 22, 7]),
			'project/image.png': new Uint8Array([137, 80, 78, 71, 0, 0])
		});

		expect(await readInputFiles([file('Project_shieldhit.ZIP', zipped)])).toEqual({
			files: { 'beam.dat': 'NSTAT 10 0', 'geo.dat': 'geo' },
			skipped: ['Project_shieldhit.ZIP/project/image.png']
		});
	});

	test('skips binary files and broken zips', async () => {
		expect(
			await readInputFiles([
				file('results.bdo', new Uint8Array([1, 0, 2, 3])),
				file('broken.zip', strToU8('not a zip')),
				file('notes.txt', strToU8('ok'))
			])
		).toEqual({ files: { 'notes.txt': 'ok' }, skipped: ['results.bdo', 'broken.zip'] });
	});
});
