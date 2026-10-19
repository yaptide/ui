import { outputsTooLarge } from './outputsSize';

const mesh = (uuid: string, xSegments: number, ySegments: number, zSegments: number) => ({
	uuid,
	geometryData: { geometryType: 'Mesh', parameters: { xSegments, ySegments, zSegments } }
});

const output = (name: string, detectorUuid: string, quantities: number) => ({
	name,
	detectorUuid,
	quantities: Array(quantities).fill({})
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
		expect(outputsTooLarge(project, 100)).toBe(
			'The outputs would take 80 GB (XZ_map: 10000 × 1 × 10000 bins × 100 tasks); ' +
				'the limit is 50 GB. Use fewer bins or tasks.'
		);
	});

	it('lets outputs under the limit through', () => {
		expect(outputsTooLarge(project, 50)).toBeUndefined();
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
		expect(outputsTooLarge(cylinder, 312)).toBeUndefined();
		expect(outputsTooLarge(cylinder, 313)).toBeDefined();
		expect(outputsTooLarge(cylinder, 400)).toBe(
			'The outputs would take 64 GB (Cyl: 1000 × 10000 bins × 2 quantities × 400 tasks); ' +
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
				1000
			)
		).toBeUndefined();
	});
});
