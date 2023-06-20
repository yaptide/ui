import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { convertToBestUnit } from './Units';
expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

test('basic conversion', () => {
	expect(convertToBestUnit(100, 'MeV')).toMatchObject({ val: 100, unit: 'MeV' });
	expect(convertToBestUnit(1000, 'MeV')).toMatchObject({ val: 1, unit: 'GeV' });
	expect(convertToBestUnit(0.1, 'MeV')).toMatchObject({ val: 100, unit: 'keV' });
	expect(convertToBestUnit(0.000001, 'MeV')).toMatchObject({ val: 1, unit: 'eV' });
	expect(convertToBestUnit(1000000, 'eV')).toMatchObject({ val: 1, unit: 'MeV' });

	expect(convertToBestUnit(100, 'cm^-2')).toMatchObject({ val: 100, unit: 'cm^-2' });
	expect(convertToBestUnit(100_00, 'cm^-2')).toMatchObject({ val: 1, unit: 'm^-2' });

	expect(convertToBestUnit(100, 'cm^3')).toMatchObject({ val: 100, unit: 'cm^3' });
	expect(convertToBestUnit(100_00_00, 'cm^3')).toMatchCloseTo({ val: 1, unit: 'm^3' });
});

test('fixed conversion', () => {
	expect(convertToBestUnit(100, 'g/cm^3')).toMatchObject({ val: 100, unit: 'g/cm^3' });
	expect(convertToBestUnit(1000000000000, 'g/cm^3')).toMatchObject({
		val: 1000000000000,
		unit: 'g/cm^3'
	});
});
