import { SimulatorType } from '../../../../types/RequestTypes';
import {
	checkSelection,
	emptyTemplate,
	InputFiles,
	inspectInputFiles,
	presentRequiredFiles,
	REQUIRED_INPUT_FILES,
	RUNNABLE_SIMULATORS,
	RunnableSimulator
} from '../inspectInputFiles';

const SHIELDHIT_FILES: InputFiles = {
	'info.json': "{'version': '', 'label': '', 'simulator': 'shieldhit'}",
	'beam.dat': 'NSTAT 1000 0',
	'geo.dat': '0 0 geometry',
	'mat.dat': 'MEDIUM 1',
	'detect.dat': 'Geometry Cyl'
};

const check = (simulator: RunnableSimulator, files: InputFiles, selected: string[]) =>
	checkSelection(simulator, selected, files, inspectInputFiles(files));

const kinds = (result: ReturnType<typeof check>) =>
	Object.fromEntries(Object.entries(result.hints).map(([name, hint]) => [name, hint?.kind]));

describe('inspectInputFiles', () => {
	test('required files belong to their simulator, other files to none', () => {
		const result = inspectInputFiles({ ...SHIELDHIT_FILES, 'sobp.dat': 'x', 'notes.txt': 'x' });

		expect(
			Object.fromEntries(
				Object.entries(result.files).map(([name, file]) => [name, file.simulator])
			)
		).toEqual({
			'info.json': null,
			'beam.dat': 'shieldhit',
			'geo.dat': 'shieldhit',
			'mat.dat': 'shieldhit',
			'detect.dat': 'shieldhit',
			'sobp.dat': null,
			'notes.txt': null
		});
	});

	test('mixed files with a downloaded copy', () => {
		expect(
			inspectInputFiles({
				'beam.dat': 'NSTAT 1000 0',
				'geo.dat': '0 0 geometry',
				'detect.dat': 'Geometry Cyl',
				'fl_sim.inp': 'TITLE',
				'fl_sim (1).inp': 'TITLE'
			})
		).toEqual({
			files: {
				'beam.dat': { simulator: 'shieldhit', issues: [] },
				'geo.dat': { simulator: 'shieldhit', issues: [] },
				'detect.dat': { simulator: 'shieldhit', issues: [] },
				'fl_sim.inp': { simulator: 'fluka', issues: [] },
				'fl_sim (1).inp': {
					simulator: null,
					issues: [
						{
							severity: 'warning',
							code: 'copy_suffix',
							message: 'Looks like a downloaded copy of fl_sim.inp',
							suggestedName: 'fl_sim.inp'
						}
					]
				}
			},
			simulators: {
				shieldhit: { possible: false, reason: 'Missing mat.dat', missing: ['mat.dat'] },
				fluka: { possible: true, missing: [] },
				geant4: {
					possible: false,
					reason: 'Missing geometry.gdml, run.mac',
					missing: ['geometry.gdml', 'run.mac']
				}
			}
		});
	});

	test.each([
		['fl_sim (1).inp', 'fl_sim.inp'],
		['fl_sim(1).inp', 'fl_sim.inp'],
		['fl_sim-2.inp', 'fl_sim.inp'],
		['fl_sim 2.inp', 'fl_sim.inp'],
		['fl_sim.inp2', 'fl_sim.inp'],
		['beam (3).dat', 'beam.dat'],
		['run.mac2', 'run.mac']
	])('%s is a copy of %s', (name, originalName) => {
		expect(inspectInputFiles({ [name]: 'x' }).files[name].issues[0].suggestedName).toBe(
			originalName
		);
	});

	test.each(['fl_sim.inp', 'beam.dat', 'sim_2.inp', 'my-beam.dat', 'geometry.gdml'])(
		'%s is not a copy',
		name => {
			expect(inspectInputFiles({ [name]: 'x' }).files[name].issues).toEqual([]);
		}
	);

	test('file content is never checked', () => {
		const files = { 'beam.dat': '', 'geo.dat': 'anything', 'mat.dat': ' \n', 'detect.dat': '' };
		const result = inspectInputFiles(files);

		expect(result.simulators.shieldhit).toEqual({ possible: true, missing: [] });
		expect(Object.values(result.files).flatMap(file => file.issues)).toEqual([]);
	});

	test('empty templates contain the required files', () => {
		expect(emptyTemplate(SimulatorType.SHIELDHIT)).toEqual({
			'beam.dat': '',
			'geo.dat': '',
			'mat.dat': '',
			'detect.dat': ''
		});
		expect(emptyTemplate(SimulatorType.FLUKA)).toEqual({ 'fl_sim.inp': '' });
		expect(emptyTemplate(SimulatorType.GEANT4)).toEqual({ 'geometry.gdml': '', 'run.mac': '' });
	});
});

describe('checkSelection', () => {
	test('all required files selected, other files allowed', () => {
		const files = { ...SHIELDHIT_FILES, 'sobp.dat': 'x', 'fl_sim.inp': 'x', 'notes.txt': 'x' };
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result).toEqual({
			valid: true,
			reason: undefined,
			hints: {
				'info.json': undefined,
				'beam.dat': {
					kind: 'ok',
					message: 'Required for SHIELD-HIT12A, included in the run'
				},
				'geo.dat': {
					kind: 'ok',
					message: 'Required for SHIELD-HIT12A, included in the run'
				},
				'mat.dat': {
					kind: 'ok',
					message: 'Required for SHIELD-HIT12A, included in the run'
				},
				'detect.dat': {
					kind: 'ok',
					message: 'Required for SHIELD-HIT12A, included in the run'
				},
				'sobp.dat': undefined,
				'fl_sim.inp': undefined,
				'notes.txt': undefined
			}
		});
	});

	test('missing required files are listed', () => {
		const { 'mat.dat': _, 'detect.dat': __, ...files } = SHIELDHIT_FILES;

		expect(check(SimulatorType.SHIELDHIT, files, Object.keys(files)).reason).toBe(
			'Missing mat.dat, detect.dat'
		);
	});

	test('required files that are not selected are suggested', () => {
		const result = check(SimulatorType.SHIELDHIT, SHIELDHIT_FILES, ['beam.dat', 'mat.dat']);

		expect(result.reason).toBe('Include geo.dat, detect.dat');
		expect(kinds(result)).toEqual({
			'info.json': undefined,
			'beam.dat': 'ok',
			'geo.dat': 'suggest',
			'mat.dat': 'ok',
			'detect.dat': 'suggest'
		});
	});

	test('FLUKA needs fl_sim.inp and accepts other .inp files', () => {
		expect(check(SimulatorType.FLUKA, { 'my_sim.inp': 'x' }, ['my_sim.inp']).reason).toBe(
			'Missing fl_sim.inp'
		);

		expect(
			check(SimulatorType.FLUKA, { 'fl_sim.inp': 'x', 'b.inp': 'x' }, ['fl_sim.inp', 'b.inp'])
				.valid
		).toBe(true);
	});

	test('Geant4 needs geometry.gdml and run.mac', () => {
		const files = { 'geometry.gdml': '', 'run.mac': '', 'extra.mac': '' };

		expect(check(SimulatorType.GEANT4, files, ['geometry.gdml']).reason).toBe(
			'Include run.mac'
		);
		expect(check(SimulatorType.GEANT4, files, Object.keys(files)).valid).toBe(true);
	});

	test('present required files', () => {
		expect(presentRequiredFiles(SimulatorType.SHIELDHIT, SHIELDHIT_FILES)).toEqual([
			'beam.dat',
			'geo.dat',
			'mat.dat',
			'detect.dat'
		]);
		expect(presentRequiredFiles(SimulatorType.GEANT4, SHIELDHIT_FILES)).toEqual([]);
	});
});

function random(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

describe('checkSelection invariants on random files', () => {
	const pool = [
		...RUNNABLE_SIMULATORS.flatMap(simulator => REQUIRED_INPUT_FILES[simulator]),
		'beam (1).dat',
		'fl_sim (1).inp',
		'a.inp',
		'sobp.dat',
		'other.gdml',
		'info.json',
		'notes.txt'
	];
	const next = random(2479);

	const cases = Array.from({ length: 1500 }, () => {
		const files: InputFiles = Object.fromEntries(
			pool.filter(() => next() < 0.6).map(name => [name, next() < 0.5 ? '' : 'x'])
		);
		const selected = Object.keys(files).filter(() => next() < 0.7);

		return { files, selected };
	});

	test.each(RUNNABLE_SIMULATORS)('%s', simulator => {
		const required = REQUIRED_INPUT_FILES[simulator];

		for (const { files, selected } of cases) {
			const inspection = inspectInputFiles(files);
			const result = checkSelection(simulator, selected, files, inspection);
			const extras = Object.keys(files).filter(name => !required.includes(name));
			const withAllExtras = checkSelection(
				simulator,
				[...selected, ...extras.filter(name => !selected.includes(name))],
				files,
				inspection
			);

			expect(result.valid).toBe(
				required.every(name => name in files && selected.includes(name))
			);
			expect(result.valid).toBe(result.reason === undefined);
			expect(inspection.simulators[simulator].possible).toBe(
				required.every(name => name in files)
			);
			expect(withAllExtras.valid).toBe(result.valid);
			expect(
				Object.entries(result.hints)
					.filter(([, hint]) => hint !== undefined)
					.map(([name]) => name)
			).toEqual(Object.keys(files).filter(name => required.includes(name)));
		}
	});
});
