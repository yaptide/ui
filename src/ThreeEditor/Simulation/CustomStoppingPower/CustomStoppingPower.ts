import { EditorJson } from '../../js/EditorJson';
import { Icru } from '../Materials/MaterialManager';
import { StoppingPowerTable } from '../Physics/Physics';
import { MappingIcruToName } from './FileNames';

interface StoppingPowerFileMetadata {
	name: string;
	icru: Icru;
	pathToFile: string;
}

export interface StoppingPowerFile {
	name: string;
	icru: Icru;
	content: string;
}

const getAvailableStoppingPowerFiles = async (path: StoppingPowerTable) => {
	const files: Record<Icru, StoppingPowerFileMetadata> = {};

	for (let key in MappingIcruToName) {
		const name = MappingIcruToName[key];
		const icru = parseInt(key);
		let pathToFile = '';

		try {
			try {
				pathToFile = await import(`./models/${path}/${name}.txt`);
			} catch (error: any) {}

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
	Record<Icru, StoppingPowerFileMetadata>
> = {
	ICRU91: await getAvailableStoppingPowerFiles('ICRU91'),
	ICRU49: await getAvailableStoppingPowerFiles('ICRU49')
} as const;

export const addCustomStoppingPowerTableToEditorJSON = async (editorJson: EditorJson) => {
	// count used stopping power tables
	const usedStoppingPowerTables = new Set<Icru>();

	for (let key in editorJson.zoneManager.zones) {
		const zone = editorJson.zoneManager.zones[key];
		console.log(zone);

		if (zone.materialPropertiesOverrides?.customStoppingPower && zone.customMaterial) {
			usedStoppingPowerTables.add(zone.customMaterial.icru);
		}
	}

	// load files for used stopping power tables
	const availableStoppingPowerFiles: Record<Icru, StoppingPowerFile> = {};

	for (let key in CustomStoppingPowerModels[editorJson.physic.stoppingPowerTable]) {
		const { name, icru, pathToFile } =
			CustomStoppingPowerModels[editorJson.physic.stoppingPowerTable][key];

		if (!usedStoppingPowerTables.has(icru)) continue;

		const content = await fetch(pathToFile)
			.then(r => r.text())
			.catch(_ => {
				console.error(`Error loading ${name} file`);

				return '';
			});

		availableStoppingPowerFiles[icru] = { name, icru, content };
	}

	editorJson.physic.availableStoppingPowerFiles = availableStoppingPowerFiles;
};
