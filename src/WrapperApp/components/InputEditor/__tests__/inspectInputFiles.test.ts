import { SimulatorType } from '../../../../types/RequestTypes';
import {
	checkSelection,
	fileStatus,
	INPUT_FILE_SPECS,
	InputFiles,
	inspectInputFiles,
	matchingSelections,
	RUNNABLE_SIMULATORS,
	RunnableSimulator
} from '../inspectInputFiles';

const BEAM_DAT = 'JPART0 2\nNSTAT 1000 0\n';
const GEO_DAT =
	'    0    0    geometry\n  RCC    1 0.0 0.0 0.0 0.0 0.0 20.0 5.0\n  END\n001 +1\n  END\n  1\n  1\n';
const MAT_DAT = 'MEDIUM 1\nICRU 276\nEND\n';
const SHIELDHIT_FILES: InputFiles = {
	'info.json': "{'version': '', 'label': '', 'simulator': 'shieldhit'}",
	'beam.dat': BEAM_DAT,
	'geo.dat': GEO_DAT,
	'mat.dat': MAT_DAT,
	'detect.dat': 'Geometry Cyl'
};
const FLUKA_INPUT = 'TITLE\nBEAM -0.15\nSTART 1000.0\nSTOP\n';

const check = (simulator: RunnableSimulator, files: InputFiles, selected: string[]) =>
	checkSelection(simulator, selected, files, inspectInputFiles(files));

const kinds = (result: ReturnType<typeof check>) =>
	Object.fromEntries(Object.entries(result.hints).map(([name, hint]) => [name, hint?.kind]));

describe('inspectInputFiles', () => {
	test('mixed files with a downloaded copy', () => {
		expect(
			inspectInputFiles({
				'beam.dat': BEAM_DAT,
				'geo.dat': GEO_DAT,
				'detect.dat': 'Geometry Cyl',
				'fl_sim.inp': FLUKA_INPUT,
				'fl_sim (1).inp': FLUKA_INPUT
			})
		).toEqual({
			files: {
				'beam.dat': { simulator: 'shieldhit', issues: [] },
				'geo.dat': { simulator: 'shieldhit', issues: [] },
				'detect.dat': { simulator: 'shieldhit', issues: [] },
				'fl_sim.inp': { simulator: 'fluka', issues: [] },
				'fl_sim (1).inp': {
					simulator: 'fluka',
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
				shieldhit: { possible: false, reason: 'mat.dat is missing', sets: [] },
				fluka: { possible: true, sets: [['fl_sim.inp'], ['fl_sim (1).inp']] },
				geant4: { possible: false, reason: 'geometry.gdml is missing', sets: [] }
			}
		});
	});
});

describe('checkSelection', () => {
	test('a generated set is valid', () => {
		const result = check(
			SimulatorType.SHIELDHIT,
			SHIELDHIT_FILES,
			Object.keys(SHIELDHIT_FILES)
		);

		expect(result.valid).toBe(true);
		expect(Object.values(kinds(result))).toEqual(['ok', 'ok', 'ok', 'ok', 'ok']);
	});

	test('empty files of the chosen simulator are invalid, not excluded', () => {
		const files = INPUT_FILE_SPECS[SimulatorType.SHIELDHIT].template;
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result.reason).toBe('beam.dat is empty');
		expect(kinds(result)).toEqual({
			'beam.dat': 'invalid',
			'geo.dat': 'invalid',
			'mat.dat': 'invalid',
			'detect.dat': 'invalid'
		});

		expect(result.hints['beam.dat']?.message).toBe(
			'beam.dat is empty, fill it in or exclude it'
		);
	});

	test('a file of another simulator is excluded', () => {
		const files = { ...SHIELDHIT_FILES, 'fl_sim.inp': FLUKA_INPUT };
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result.reason).toBe("Exclude fl_sim.inp, it isn't a SHIELD-HIT12A file");
		expect(result.hints['fl_sim.inp']).toEqual({
			kind: 'exclude',
			message: 'fl_sim.inp is a Fluka file, exclude it to run SHIELD-HIT12A'
		});
		expect(result.hints['beam.dat']?.kind).toBe('ok');
	});

	test('an unknown file is excluded', () => {
		const files = { ...SHIELDHIT_FILES, 'notes.txt': 'hello' };
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result.hints['notes.txt']).toEqual({
			kind: 'exclude',
			message: "notes.txt isn't an input file of SHIELD-HIT12A, exclude it"
		});
	});

	test('an empty optional file and a copy that needs renaming are invalid', () => {
		const files = { ...SHIELDHIT_FILES, 'detect.dat': '', 'beam (1).dat': 'NSTAT 10 0' };
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result.hints['detect.dat']?.kind).toBe('invalid');
		expect(result.hints['beam (1).dat']).toEqual({
			kind: 'invalid',
			message: 'Rename beam (1).dat to beam.dat or exclude it'
		});
		expect(result.reason).toBe('detect.dat is empty, fill it in or exclude it');
	});

	test('a required file that is not selected is suggested', () => {
		const result = check(SimulatorType.SHIELDHIT, SHIELDHIT_FILES, ['beam.dat', 'mat.dat']);

		expect(result.reason).toBe('Include geo.dat');
		expect(result.hints['geo.dat']).toEqual({
			kind: 'suggest',
			message: 'Required for SHIELD-HIT12A, include it'
		});
		expect(result.hints['detect.dat']).toBeUndefined();
	});

	test('a required empty file that is not selected is invalid', () => {
		const files = { ...SHIELDHIT_FILES, 'geo.dat': '' };
		const result = check(SimulatorType.SHIELDHIT, files, ['beam.dat']);

		expect(result.hints['geo.dat']).toEqual({
			kind: 'invalid',
			message: 'geo.dat is empty, fill it in'
		});
	});

	test('a missing required file is only reported in the reason', () => {
		const { 'mat.dat': _, ...files } = SHIELDHIT_FILES;
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result.reason).toBe('mat.dat is missing');
		expect(Object.keys(result.hints)).toEqual(Object.keys(files));
	});

	test('FLUKA needs exactly one .inp file', () => {
		const files = { 'a.inp': FLUKA_INPUT, 'b.inp': FLUKA_INPUT };

		const none = check(SimulatorType.FLUKA, files, []);
		expect(none.reason).toBe('Select one .inp file');
		expect(none.hints['a.inp']).toEqual({ kind: 'suggest', message: 'Choose one .inp file' });

		const both = check(SimulatorType.FLUKA, files, ['a.inp', 'b.inp']);
		expect(both.reason).toBe('Select only one .inp file');
		expect(kinds(both)).toEqual({ 'a.inp': 'tooMany', 'b.inp': 'tooMany' });

		const one = check(SimulatorType.FLUKA, files, ['a.inp']);
		expect(one.valid).toBe(true);
		expect(kinds(one)).toEqual({ 'a.inp': 'ok', 'b.inp': undefined });
	});

	test('a single FLUKA input that is not selected is suggested', () => {
		const result = check(SimulatorType.FLUKA, { 'fl_sim.inp': FLUKA_INPUT }, []);

		expect(result.reason).toBe('Include fl_sim.inp');
		expect(result.hints['fl_sim.inp']?.kind).toBe('suggest');
	});
});

describe('content checks', () => {
	test.each([
		['beam.dat', BEAM_DAT, []],
		['beam.dat', 'JPART0 2\n', ['missing_nstat']],
		['geo.dat', GEO_DAT, []],
		['geo.dat', '    0    0    geometry\n  END\n', ['missing_end']],
		['mat.dat', MAT_DAT, []],
		['mat.dat', 'ICRU 276\n', ['missing_medium']],
		['fl_sim.inp', FLUKA_INPUT, []],
		['fl_sim.inp', 'TITLE\nSTOP\n', ['missing_start']],
		['fl_sim.inp', 'TITLE\nSTART 10.0\n', ['missing_stop']],
		['my_sim (1).inp', 'TITLE\n', ['copy_suffix', 'missing_start', 'missing_stop']],
		['geometry.gdml', '<?xml version="1.0"?>\n<gdml xmlns:xsi="x"><setup/></gdml>', []],
		['geometry.gdml', '<gdml><setup></gdml>', ['invalid_xml']],
		['geometry.gdml', '<world/>', ['not_gdml']],
		['run.mac', '/run/initialize\n/run/beamOn 1000\n', []],
		['run.mac', '/run/initialize\n', ['missing_beam_on']],
		['detect.dat', 'anything', []],
		['notes.txt', 'anything', ['unknown_file']]
	])('%s: %j', (name, content, codes) => {
		expect(
			inspectInputFiles({ [name]: content }).files[name].issues.map(issue => issue.code)
		).toEqual(codes);
	});

	test('a content error blocks the run and is shown on the file', () => {
		const files = { ...SHIELDHIT_FILES, 'geo.dat': '    0    0    geometry\n' };
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result.reason).toBe(
			'geo.dat needs an END line after the bodies and another after the zones'
		);

		expect(result.hints['geo.dat']).toEqual({
			kind: 'invalid',
			message: 'geo.dat needs an END line after the bodies and another after the zones'
		});
	});

	test('a content warning does not block the run', () => {
		const files = { ...SHIELDHIT_FILES, 'beam.dat': 'JPART0 2\n' };
		const result = check(SimulatorType.SHIELDHIT, files, Object.keys(files));

		expect(result.valid).toBe(true);
		expect(result.hints['beam.dat']?.kind).toBe('warning');
		expect(result.warnings).toEqual([
			"beam.dat has no NSTAT line, so the number of primary particles can't be changed"
		]);
	});
});

describe('matchingSelections', () => {
	const select = (simulator: RunnableSimulator, files: InputFiles) =>
		matchingSelections(simulator, files, inspectInputFiles(files));

	test('runnable sets when the simulator can run', () => {
		expect(select(SimulatorType.SHIELDHIT, SHIELDHIT_FILES)).toEqual([
			Object.keys(SHIELDHIT_FILES)
		]);

		expect(select(SimulatorType.FLUKA, { 'a.inp': FLUKA_INPUT, 'b.inp': FLUKA_INPUT })).toEqual(
			[['a.inp'], ['b.inp']]
		);
	});

	test('all files of the simulator when it cannot run yet', () => {
		const files = { ...INPUT_FILE_SPECS[SimulatorType.GEANT4].template, 'beam.dat': 'b' };

		expect(select(SimulatorType.GEANT4, files)).toEqual([['geometry.gdml', 'run.mac']]);
		expect(select(SimulatorType.FLUKA, { 'fl_sim.inp': '' })).toEqual([['fl_sim.inp']]);
	});

	test('nothing when there are no files of the simulator', () => {
		expect(select(SimulatorType.GEANT4, SHIELDHIT_FILES)).toEqual([]);
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
		'beam.dat',
		'geo.dat',
		'mat.dat',
		'detect.dat',
		'sobp.dat',
		'beam (1).dat',
		'detect-2.dat',
		'fl_sim.inp',
		'fl_sim (1).inp',
		'a.inp',
		'fl_sim.inp2',
		'geometry.gdml',
		'run.mac',
		'run 2.mac',
		'info.json',
		'notes.txt'
	];

	const infos = [
		"{'simulator': 'shieldhit'}",
		'{"simulator": "fluka"}',
		'{"simulator": "geant4"}',
		'{"simulator": "topas"}',
		''
	];

	const validContent = (name: string) => {
		if (name.endsWith('.inp') || name.endsWith('.inp2')) return FLUKA_INPUT;

		if (name.startsWith('beam')) return BEAM_DAT;

		if (name.startsWith('geo.')) return GEO_DAT;

		if (name.startsWith('mat')) return MAT_DAT;

		if (name.endsWith('.gdml')) return '<gdml><setup/></gdml>';

		if (name.includes('.mac')) return '/run/beamOn 10';

		return 'x';
	};
	const contents = ['', 'x', '  \n', 'NSTAT 10', 'TITLE\nSTOP', 'START 1.0', '<gdml>'];
	const next = random(2479);
	const pick = <T>(items: T[]) => items[Math.floor(next() * items.length)];

	const cases = Array.from({ length: 1500 }, () => {
		const files: InputFiles = Object.fromEntries(
			pool
				.filter(() => next() < 0.5)
				.map(name => [
					name,
					name === 'info.json'
						? pick(infos)
						: next() < 0.5
							? validContent(name)
							: pick(contents)
				])
		);
		const selected = Object.keys(files).filter(() => next() < 0.6);

		return { files, selected };
	});

	test.each(RUNNABLE_SIMULATORS)('%s', simulator => {
		const spec = INPUT_FILE_SPECS[simulator];

		for (const { files, selected } of cases) {
			const inspection = inspectInputFiles(files);
			const { possible, sets } = inspection.simulators[simulator];
			const status = (name: string) => fileStatus(name, simulator, files, inspection);
			const candidates = Object.keys(files).filter(
				name => spec.singleOfExtension && status(name) === 'usable' && name !== 'info.json'
			);

			expect(possible).toBe(sets.length > 0);

			for (const set of sets)
				expect(checkSelection(simulator, set, files, inspection).valid).toBe(true);

			const result = checkSelection(simulator, selected, files, inspection);
			const expectedValid =
				selected.length > 0 &&
				selected.every(name => status(name) === 'usable') &&
				spec.required.every(name => selected.includes(name)) &&
				(!spec.singleOfExtension ||
					candidates.filter(name => selected.includes(name)).length === 1);

			expect(result.valid).toBe(expectedValid);
			expect(result.valid).toBe(result.reason === undefined);

			const selectedHints = selected.map(name => ({
				name,
				status: status(name),
				kind: result.hints[name]?.kind
			}));

			expect(
				selectedHints.filter(
					({ status, kind }) => (status === 'foreign') !== (kind === 'exclude')
				)
			).toEqual([]);

			expect(
				selectedHints.filter(
					({ status, kind }) =>
						(status === 'empty' ||
							status === 'invalidContent' ||
							status === 'renameNeeded') &&
						kind !== 'invalid'
				)
			).toEqual([]);

			expect(
				selectedHints.filter(
					({ kind }) => result.valid && kind !== 'ok' && kind !== 'warning'
				)
			).toEqual([]);
		}
	});
});
