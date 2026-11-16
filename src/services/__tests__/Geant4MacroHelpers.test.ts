import {
	distributePrimaries,
	generateRandomSeeds,
	mergeGeant4ResultFiles,
	prepareWorkerMacro
} from '../Geant4MacroHelpers';

describe('Geant4MacroHelpers', () => {
	describe('distributePrimaries', () => {
		it('evenly divides primaries among workers', () => {
			expect(distributePrimaries(1000, 4)).toEqual([250, 250, 250, 250]);
		});

		it('distributes remainder correctly to the first workers', () => {
			expect(distributePrimaries(10, 3)).toEqual([4, 3, 3]);
			expect(distributePrimaries(11, 3)).toEqual([4, 4, 3]);
			expect(distributePrimaries(12, 3)).toEqual([4, 4, 4]);
		});

		it('handles cases where total primaries is less than worker count', () => {
			expect(distributePrimaries(2, 4)).toEqual([1, 1, 0, 0]);
		});

		it('handles zero or negative inputs', () => {
			expect(distributePrimaries(0, 3)).toEqual([0, 0, 0]);
			expect(distributePrimaries(100, 0)).toEqual([]);
		});
	});

	describe('generateRandomSeeds', () => {
		it('returns two positive 32-bit integers', () => {
			const [s1, s2] = generateRandomSeeds();
			expect(s1).toBeGreaterThan(0);
			expect(s1).toBeLessThanOrEqual(2147483647);
			expect(s2).toBeGreaterThan(0);
			expect(s2).toBeLessThanOrEqual(2147483647);
		});

		it('subsequent calls yield different seeds', () => {
			const [a1, a2] = generateRandomSeeds();
			const [b1, b2] = generateRandomSeeds();
			expect(a1 !== b1 || a2 !== b2).toBe(true);
		});
	});

	describe('prepareWorkerMacro', () => {
		const sampleMacro = [
			'/run/initialize',
			'/gps/pos/type Point',
			'/score/create/boxMesh boxMesh_1',
			'/score/close',
			'/run/beamOn 10000',
			'/score/dumpQuantityToFile boxMesh_1 dose output.txt'
		].join('\n');

		it('injects /random/setSeeds and replaces /run/beamOn with worker primaries', () => {
			const result = prepareWorkerMacro(sampleMacro, 2500, [12345, 67890]);

			expect(result).toContain('/random/setSeeds 12345 67890');
			expect(result).toContain('/run/beamOn 2500');
			expect(result).not.toContain('/run/beamOn 10000');

			// Check order: setSeeds must come directly before beamOn
			const lines = result.split('\n');
			const seedsIdx = lines.findIndex(l => l.startsWith('/random/setSeeds 12345 67890'));
			const beamOnIdx = lines.findIndex(l => l.startsWith('/run/beamOn 2500'));

			expect(seedsIdx).toBeGreaterThan(-1);
			expect(beamOnIdx).toBe(seedsIdx + 1);
		});

		it('appends setSeeds and beamOn if /run/beamOn was missing', () => {
			const minimalMacro = '/run/initialize';
			const result = prepareWorkerMacro(minimalMacro, 500, [111, 222]);

			expect(result).toContain('/random/setSeeds 111 222');
			expect(result).toContain('/run/beamOn 500');
		});
	});

	describe('mergeGeant4ResultFiles', () => {
		const fileHeader = [
			'# mesh name: boxMesh_1',
			'# primitive scorer name: dose',
			'# iX, iY, iZ, total(value) [Gy], total(val^2), entry'
		].join('\n');

		it('returns single file unchanged', () => {
			const singleFile = `${fileHeader}\n0,0,0,10.0,100.0,2\n`;
			expect(mergeGeant4ResultFiles([singleFile])).toBe(singleFile);
		});

		it('returns empty string if input files array is empty', () => {
			expect(mergeGeant4ResultFiles([])).toBe('');
		});

		it('correctly sums values, squares, and entries across multiple workers', () => {
			const worker1 = [
				fileHeader,
				'0,0,0,10.0,100.0,2',
				'0,0,1,5.0,25.0,1',
				'0,0,2,0.0,0.0,0'
			].join('\n');

			const worker2 = [
				fileHeader,
				'0,0,0,4.0,16.0,1',
				'0,0,1,15.0,225.0,3',
				'0,0,2,2.0,4.0,1'
			].join('\n');

			const worker3 = [
				fileHeader,
				'0,0,0,1.0,1.0,1',
				'0,0,1,0.0,0.0,0',
				'0,0,2,8.0,64.0,2'
			].join('\n');

			const merged = mergeGeant4ResultFiles([worker1, worker2, worker3]);
			const lines = merged.trim().split('\n');

			// Header should be preserved
			expect(lines[0]).toBe('# mesh name: boxMesh_1');
			expect(lines[1]).toBe('# primitive scorer name: dose');
			expect(lines[2]).toBe('# iX, iY, iZ, total(value) [Gy], total(val^2), entry');

			// Cell [0,0,0]:
			// value: 10 + 4 + 1 = 15
			// val^2: 100 + 16 + 1 = 117
			// entry: 2 + 1 + 1 = 4
			expect(lines[3]).toBe('0,0,0,15,117,4');

			// Cell [0,0,1]:
			// value: 5 + 15 + 0 = 20
			// val^2: 25 + 225 + 0 = 250
			// entry: 1 + 3 + 0 = 4
			expect(lines[4]).toBe('0,0,1,20,250,4');

			// Cell [0,0,2]:
			// value: 0 + 2 + 8 = 10
			// val^2: 0 + 4 + 64 = 68
			// entry: 0 + 1 + 2 = 3
			expect(lines[5]).toBe('0,0,2,10,68,3');
		});
	});
});
