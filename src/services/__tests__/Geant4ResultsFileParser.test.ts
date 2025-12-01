import { Geant4ResultsFileParser } from '../Geant4ResultsFileParser';

describe('Geant4ResultsFileParser', () => {
	test('should parse cylinder scorer', async () => {
		const macro =
			'/score/create/cylinderMesh TestCyl\n' +
			'/score/mesh/translate/xyz 0.5 1 1.5 cm\n' +
			'/score/mesh/cylinderSize 2 10 cm\n' +
			'/score/mesh/nBin 100 200\n' +
			'/score/quantity energyDeposit eDep\n' +
			'/score/close\n';

		const parser = new Geant4ResultsFileParser(1000, macro);

		expect(parser.scorersMetadata).toHaveProperty('TestCyl');
		expect(parser.scorersMetadata['TestCyl'].type).toEqual('cylinder');
		expect(parser.scorersMetadata['TestCyl'].binsAlongAxis).toMatchObject({ r: 100, z: 200 });
		expect(parser.scorersMetadata['TestCyl'].translation).toMatchObject({
			x: 0.5,
			y: 1,
			z: 1.5
		});
		expect(parser.scorersMetadata['TestCyl'].size).toMatchObject({ r: 2, z: 10 });
		expect(parser.scorersMetadata['TestCyl'].start).toMatchObject({ r: 0, z: -8.5 });
		expect(parser.scorersMetadata['TestCyl'].end).toMatchObject({ r: 2, z: 11.5 });
	});

	test('should parse box scorer', async () => {
		const macro =
			'/score/create/boxMesh TestBox\n' +
			'/score/mesh/translate/xyz 0.5 1 1.5 cm\n' +
			'/score/mesh/boxSize 5 10 15 cm\n' +
			'/score/mesh/nBin 50 100 200\n' +
			'/score/quantity energyDeposit eDep\n' +
			'/score/close\n';

		const parser = new Geant4ResultsFileParser(1000, macro);

		expect(parser.scorersMetadata).toHaveProperty('TestBox');
		expect(parser.scorersMetadata['TestBox'].type).toEqual('box');
		expect(parser.scorersMetadata['TestBox'].binsAlongAxis).toMatchObject({
			x: 50,
			y: 100,
			z: 200
		});

		expect(parser.scorersMetadata['TestBox'].translation).toMatchObject({
			x: 0.5,
			y: 1,
			z: 1.5
		});
		expect(parser.scorersMetadata['TestBox'].size).toMatchObject({ x: 5, y: 10, z: 15 });
		expect(parser.scorersMetadata['TestBox'].start).toMatchObject({ x: -4.5, y: -9, z: -13.5 });
		expect(parser.scorersMetadata['TestBox'].end).toMatchObject({ x: 5.5, y: 11, z: 16.5 });
	});

	test('should invert columns', async () => {
		let array = [
			['0', '0', '0', '0', '1', '1', '1', '1', '2', '2', '2', '2'], // bins
			['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3'], // bins
			['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] // values
		];

		array = Geant4ResultsFileParser.swapColumns(array, 0, 2, 3, 4);
		expect(array[3]).toEqual(['0', '4', '8', '1', '5', '9', '2', '6', '10', '3', '7', '11']);
	});

	test('should invert columns when one does not change', async () => {
		let array = [
			['0', '0', '0', '0', '1', '1', '1', '1', '2', '2', '2', '2'], // bins (not swapped)
			['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
			['0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3'], // bins
			['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] // values
		];

		array = Geant4ResultsFileParser.swapColumns(array, 1, 2, 1, 4);
		expect(array[1]).toEqual(['0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3']);
		expect(array[3]).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);
	});
});
