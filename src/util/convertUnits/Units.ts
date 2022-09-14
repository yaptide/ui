
import configureMeasurements from 'convert-units';
import baseMeasure, { isBaseUnit } from "./baseUnit";

const convert = configureMeasurements({ baseMeasure });

const isFixedUnit = (unit: string) => {
	return ['g/cm^3', 'MeV/g', 'MeV/cm', 'keV/um', 'MeV cm^2/ g'].includes(unit);
};

export const convertValue = (value: number, unit: string) => {
	if (isFixedUnit(unit)) return { val: value, unit: unit };

	let convertedValue = null;
	try {
		let preUnit = unit[0];
		let postUnit = unit.slice(1);
		if (['Gy'].includes(unit)) {
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