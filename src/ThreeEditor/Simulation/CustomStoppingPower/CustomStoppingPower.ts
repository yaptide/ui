import { StoppingPowerTable } from '../Physics/Physics';
import { MappingIcruToName } from './FileNames';

interface StoppingPowerFile {
	name: string;
	icru: number;
	pathToFile: string;
}

const getAvailableStoppingPowerFiles = (path: StoppingPowerTable) => {
	const files: Record<number, StoppingPowerFile> = {};

	for (let key in MappingIcruToName) {
		const name = MappingIcruToName[key];
		const icru = parseInt(key);
		try {
			const pathToFile = require(`./models/${path}/${name}`);

			files[icru] = { name, icru, pathToFile };
		} catch (error: any) {
			if (error.code === 'MODULE_NOT_FOUND') {
				// file not found
			} else {
				throw error;
			}
		}
	}
	return files;
};

export const CustomStoppingPowerModels: Record<
	StoppingPowerTable,
	Record<number, StoppingPowerFile>
> = {
	ICRU91: getAvailableStoppingPowerFiles('ICRU91'),
	ICRU49: getAvailableStoppingPowerFiles('ICRU49')
} as const;
