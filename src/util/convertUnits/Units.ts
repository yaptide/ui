import configureMeasurements from 'convert-units';

import { baseMeasure, inverseOfSurfaceMeasure, isBaseUnit, volumeMeasure } from './baseUnit';

const convert = configureMeasurements({
	baseMeasure,
	fluenceMeasure: inverseOfSurfaceMeasure,
	volumeMeasure
});

const fixedUnits = ['g/cm^3', 'MeV/g', 'MeV/cm', 'keV/um', 'MeV cm^2 / g'];

const isFixedUnit = (unit: string) => {
	return fixedUnits.includes(unit);
};

const baseUnits = ['m', 'm^-2', 'm^3', 'eV', 'eV/u', 'eV/nucleon', 'Gy', 'Sv'];

export const convertToBestUnit = (value: number, unit: string) => {
	if (isFixedUnit(unit)) return { val: value, unit: unit };

	if (convert().possibilities().includes(unit)) return convert(value).from(unit).toBest();

	let convertedValue = null;
	try {
		let preUnit = unit[0];
		let postUnit = unit.slice(1);
		if (baseUnits.includes(unit)) {
			preUnit = '';
			postUnit = unit;
		}

		if (isBaseUnit(preUnit)) {
			convertedValue = convert(value).from(preUnit).toBest();
			if (convertedValue) convertedValue.unit = convertedValue?.unit + postUnit;
		}
	} catch (e) {
		console.error(e);
	}
	return convertedValue;
};
