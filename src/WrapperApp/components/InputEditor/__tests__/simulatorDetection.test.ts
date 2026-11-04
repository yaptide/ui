import { SimulatorType } from '../../../../types/RequestTypes';
import {
	checkSelection,
	emptyFiles,
	fromConverterDetection,
	RequiredInputFiles,
	SimulatorDetection,
	sortInputFileNames
} from '../simulatorDetection';

const REQUIRED: RequiredInputFiles = {
	[SimulatorType.SHIELDHIT]: ['beam.dat', 'geo.dat', 'mat.dat', 'detect.dat'],
	[SimulatorType.FLUKA]: ['fl_sim.inp'],
	[SimulatorType.GEANT4]: ['geometry.gdml', 'run.mac']
};

const FILES = {
	'info.json': '{}',
	'sobp.dat': 'x',
	'beam.dat': 'x',
	'geo.dat': 'x',
	'mat.dat': 'x',
	'detect.dat': 'x'
};

const DETECTION: SimulatorDetection = {
	files: {
		'info.json': { simulator: null, issues: [] },
		'sobp.dat': { simulator: null, issues: [] },
		'beam.dat': { simulator: SimulatorType.SHIELDHIT, issues: [] },
		'geo.dat': { simulator: SimulatorType.SHIELDHIT, issues: [] },
		'mat.dat': { simulator: SimulatorType.SHIELDHIT, issues: [] },
		'detect.dat': { simulator: SimulatorType.SHIELDHIT, issues: [] }
	},
	simulators: {
		[SimulatorType.SHIELDHIT]: { possible: true, missing: [] },
		[SimulatorType.FLUKA]: {
			possible: false,
			reason: 'Missing fl_sim.inp',
			missing: ['fl_sim.inp']
		},
		[SimulatorType.GEANT4]: {
			possible: false,
			reason: 'Missing geometry.gdml, run.mac',
			missing: ['geometry.gdml', 'run.mac']
		}
	}
};

describe('fromConverterDetection', () => {
	test('renames suggested_name to suggestedName', () => {
		expect(
			fromConverterDetection({
				files: {
					'fl_sim (1).inp': {
						simulator: null,
						issues: [
							{
								severity: 'warning',
								code: 'copy_suffix',
								message: 'Looks like a downloaded copy of fl_sim.inp',
								suggested_name: 'fl_sim.inp'
							}
						]
					}
				},
				simulators: DETECTION.simulators
			})
		).toEqual({
			files: {
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
			simulators: DETECTION.simulators
		});
	});
});

describe('checkSelection', () => {
	const check = (selected: string[]) =>
		checkSelection(
			SimulatorType.SHIELDHIT,
			REQUIRED[SimulatorType.SHIELDHIT],
			selected,
			FILES,
			DETECTION
		);

	test('all required files selected, other files allowed', () => {
		const result = check(Object.keys(FILES));

		expect(result.valid).toBe(true);
		expect(result.reason).toBeUndefined();
		expect(result.hints['sobp.dat']).toBeUndefined();
		expect(result.hints['beam.dat']).toEqual({
			kind: 'ok',
			message: 'Required for SHIELD-HIT12A, included in the run'
		});
	});

	test('required files that are not selected are suggested', () => {
		const result = check(['beam.dat', 'mat.dat', 'sobp.dat']);

		expect(result.reason).toBe('Include geo.dat, detect.dat');
		expect(result.hints['geo.dat']).toEqual({
			kind: 'suggest',
			message: 'Required for SHIELD-HIT12A, include it'
		});
	});

	test('the reason from the converter comes first', () => {
		const result = checkSelection(
			SimulatorType.FLUKA,
			REQUIRED[SimulatorType.FLUKA],
			Object.keys(FILES),
			FILES,
			DETECTION
		);

		expect(result).toEqual({
			valid: false,
			reason: 'Missing fl_sim.inp',
			hints: Object.fromEntries(Object.keys(FILES).map(name => [name, undefined]))
		});
	});
});

describe('sortInputFileNames', () => {
	test('required files first, in the converter order, then other files', () => {
		expect(sortInputFileNames(Object.keys(FILES), DETECTION, REQUIRED)).toEqual([
			'beam.dat',
			'geo.dat',
			'mat.dat',
			'detect.dat',
			'info.json',
			'sobp.dat'
		]);
	});

	test('alphabetical before the converter has answered', () => {
		expect(sortInputFileNames(['geo.dat', 'beam.dat'], undefined, undefined)).toEqual([
			'beam.dat',
			'geo.dat'
		]);
	});
});

test('emptyFiles', () => {
	expect(emptyFiles(['geometry.gdml', 'run.mac'])).toEqual({
		'geometry.gdml': '',
		'run.mac': ''
	});
});
