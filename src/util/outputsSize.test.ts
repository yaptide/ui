import { outputsTooLarge } from './outputsSize';

const mesh = (uuid: string, xSegments: number, ySegments: number, zSegments: number) => ({
	uuid,
	geometryData: { geometryType: 'Mesh', parameters: { xSegments, ySegments, zSegments } }
});

const output = (
	name: string,
	detectorUuid: string,
	quantities: number,
	diffBins: number[] = []
) => ({
	name,
	detectorUuid,
	quantities: Array(quantities).fill({ modifiers: diffBins.map(binsNumber => ({ binsNumber })) })
});

// the outputs of simulation 2089
const project = {
	detectorManager: {
		detectors: [mesh('xz', 10000, 1, 10000), mesh('xy', 300, 300, 1), mesh('z', 1, 1, 200)]
	},
	scoringManager: {
		outputs: [
			output('XZ_map', 'xz', 1),
			output('XY_map', 'xy', 1),
			output('Z_profile', 'z', 4),
			output('Z_profile_let', 'z', 5)
		]
	}
};

describe('outputsTooLarge', () => {
	it('refuses outputs over the limit and names the largest one', () => {
		expect(outputsTooLarge(project, 100, 1e9)).toBe(
			'The outputs would take 80 GB (XZ_map: 10000 × 1 × 10000 bins × 100 tasks); ' +
				'the limit is 50 GB. Use fewer bins or tasks.'
		);
	});

	it('lets outputs under the limit through', () => {
		expect(outputsTooLarge(project, 50, 1e9)).toBeUndefined();
	});

	it('multiplies the bins of a quantity by its first two differential scorings', () => {
		const spectrum = {
			detectorManager: { detectors: [mesh('xy', 1000, 1000, 1)] },
			scoringManager: { outputs: [output('Spectrum', 'xy', 1, [100])] }
		};

		// 1000 × 1000 bins × 100 Diff1 bins × 8 bytes = 0.8 GB a task
		expect(outputsTooLarge(spectrum, 62, 1e9)).toBeUndefined();
		expect(outputsTooLarge(spectrum, 100, 1e9)).toBe(
			'The outputs would take 80 GB (Spectrum: 1000 × 1000 × 1 bins × 100 tasks); ' +
				'the limit is 50 GB. Use fewer bins or tasks.'
		);

		// a third modifier is not written to detect.dat
		spectrum.scoringManager.outputs = [output('Spectrum', 'xy', 1, [10, 10, 1000])];
		expect(outputsTooLarge(spectrum, 100, 1e9)).toBe(
			'The outputs would take 80 GB (Spectrum: 1000 × 1000 × 1 bins × 100 tasks); ' +
				'the limit is 50 GB. Use fewer bins or tasks.'
		);
	});

	it('counts the quantities and the bins of a cylinder', () => {
		const cylinder = {
			detectorManager: {
				detectors: [
					{
						uuid: 'cyl',
						geometryData: {
							geometryType: 'Cyl',
							parameters: { radialSegments: 1000, zSegments: 10000 }
						}
					}
				]
			},
			scoringManager: { outputs: [output('Cyl', 'cyl', 2)] }
		};

		// 1000 × 10000 bins × 2 quantities × 8 bytes = 0.16 GB a task
		expect(outputsTooLarge(cylinder, 312, 1e9)).toBeUndefined();
		expect(outputsTooLarge(cylinder, 313, 1e9)).toBeDefined();
		expect(outputsTooLarge(cylinder, 400, 1e9)).toBe(
			'The outputs would take 64 GB (Cyl: 1000 × 10000 bins × 400 tasks); ' +
				'the limit is 50 GB. Use fewer bins or tasks.'
		);
	});

	it('takes a single bin for an output without a mesh', () => {
		expect(
			outputsTooLarge(
				{
					detectorManager: { detectors: [] },
					scoringManager: { outputs: [output('Zone', 'none', 1)] }
				},
				1000,
				1e9
			)
		).toBeUndefined();
	});

	it('runs no more tasks than primaries, as the server does', () => {
		// 100 tasks for 50 primaries run as 50 tasks: 40 GB
		expect(outputsTooLarge(project, 100, 50)).toBeUndefined();
		expect(outputsTooLarge(project, 100, 70)).toBe(
			'The outputs would take 56 GB (XZ_map: 10000 × 1 × 10000 bins × 70 tasks); ' +
				'the limit is 50 GB. Use fewer bins or tasks.'
		);
		// an unknown number of primaries keeps the tasks asked for
		expect(outputsTooLarge(project, 100, NaN)).toBeDefined();
	});
});
