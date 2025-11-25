import { meta } from 'eslint-plugin-simple-import-sort';

import { Page1D, Page2D } from '../JsRoot/GraphData';

const VALUE_HEADER_UNIT_REGEX = /\[(\w+)]/g;

interface ResultFileMetadata {
	dimensions: number;
	meshName: string;
	scorerName: string;
}

interface XYZ {
	x: number;
	y: number;
	z: number;
}

interface RAD {
	z: number;
	r: number;
}

interface ScorerMetadata<T extends 'box' | 'cylinder'> {
	type: T;
	translation: XYZ;
	binsAlongAxis: T extends 'box' ? XYZ : RAD;
	size: T extends 'box' ? XYZ : RAD;
	start: T extends 'box' ? XYZ : RAD;
	end: T extends 'box' ? XYZ : RAD;
}

/**
 * Default values for box detector
 */
function emptyBox(): ScorerMetadata<'box'> {
	return {
		type: 'box',
		translation: { x: 0, y: 0, z: 0 },
		binsAlongAxis: { x: 1, y: 1, z: 1 },
		size: { x: 1, y: 1, z: 1 },
		start: { x: -1, y: -1, z: -1 },
		end: { x: 1, y: 1, z: 1 }
	};
}

/**
 * Default values for cylinder detector
 */
function emptyCylinder(): ScorerMetadata<'cylinder'> {
	return {
		type: 'cylinder',
		translation: { x: 0, y: 0, z: 0 },
		binsAlongAxis: { z: 1, r: 1 },
		size: { z: 1, r: 1 },
		start: { z: -1, r: 0 },
		end: { z: 1, r: 1 }
	};
}

export class Geant4ResultsFileParser {
	numPrimaries: number;
	scorersMetadata: { [key: string]: ScorerMetadata<'box'> | ScorerMetadata<'cylinder'> };

	constructor(numPrimaries: number, macroFile: string) {
		this.numPrimaries = numPrimaries;
		this.scorersMetadata = {};
		this.parseMacroFile(macroFile);
	}

	/**
	 * Parses given macro file to find all information about scorers in the simulation.
	 * This is needed to calculate the axis ranges in cm (Geant4 provides only bin numbers).
	 * We can't get this information from project JSON, because YAPTIDE allows running directly from
	 * macro files that are pasted in - without project data.
	 */
	private parseMacroFile(macroFile: string) {
		const lines = macroFile.split('\n');
		let meshName: string | undefined = undefined;
		let createCmd: string;

		// iterate over macro commands top to bottom and store values for each scorer
		// The structure of the declarations is as follows:
		// /score/create/boxMesh name
		// /some/command
		// /some/command
		// /some/command
		// /score/close
		// Lucky for us, every command is scoped (/score/create starts, /score/close ends)
		// So we don't need to worry about mismatching configuration options with meshes
		// We can just read the lines as they go

		for (const line of lines) {
			// Command:
			// /score/create/{boxMesh, cylinderMesh}
			if (line.startsWith('/score/create')) {
				[createCmd, meshName] = line.split(' ');
				const meshType = createCmd.split('/').at(-1)!.slice(0, -4) as 'box' | 'cylinder';
				this.scorersMetadata[meshName] = meshType == 'box' ? emptyBox() : emptyCylinder();
			}

			// Command:
			// /score/mesh/translate/xyz <x> <y> <z> cm
			// defaults to 0, 0, 0
			if (line.startsWith('/score/mesh/translate/xyz') && meshName) {
				const [_, x, y, z] = line.split(' ');
				this.scorersMetadata[meshName].translation = {
					x: parseFloat(x),
					y: parseInt(y),
					z: parseFloat(z)
				};
			}

			// Command:
			// /score/mesh/boxSize <x> <y> <z> cm
			// uses half-widths!
			// defaults to 1, 1, 1
			if (line.startsWith('/score/mesh/boxSize') && meshName) {
				const [_, x, y, z] = line.split(' ');
				this.scorersMetadata[meshName].size = {
					x: parseFloat(x),
					y: parseInt(y),
					z: parseFloat(z)
				};
			}

			// Command:
			// /score/mesh/cylinderSize <r> <z> cm
			// uses half-widths for depth!
			// defaults to 1, 1
			if (line.startsWith('/score/mesh/cylinderSize') && meshName) {
				const [_, r, z] = line.split(' ');
				this.scorersMetadata[meshName].size = { z: parseFloat(z), r: parseFloat(r) };
			}

			// Command:
			// /score/mesh/nBin <x> <y> <z>
			// defaults to 1, 1, 1
			if (
				line.startsWith('/score/mesh/nBin') &&
				meshName &&
				this.scorersMetadata[meshName].type === 'box'
			) {
				const [_, x, y, z] = line.split(' ');
				this.scorersMetadata[meshName].binsAlongAxis = {
					x: parseFloat(x),
					y: parseInt(y),
					z: parseFloat(z)
				};
			}

			// Command:
			// /score/mesh/nBin <r> <z>
			// defaults to 1, 1
			if (
				line.startsWith('/score/mesh/nBin') &&
				meshName &&
				this.scorersMetadata[meshName].type === 'cylinder'
			) {
				const [_, r, z] = line.split(' ');
				this.scorersMetadata[meshName].binsAlongAxis = {
					r: parseFloat(r),
					z: parseFloat(z)
				};
			}
		}

		for (let metadata of Object.values(this.scorersMetadata)) {
			if (metadata.type === 'cylinder') {
				metadata.start = { z: metadata.translation.z - metadata.size.z, r: 0 };
				metadata.end = { z: metadata.translation.z + metadata.size.z, r: metadata.size.r };
			} else if (metadata.type === 'box') {
				metadata.start = {
					x: metadata.translation.z - metadata.size.z,
					y: metadata.translation.z - metadata.size.z,
					z: metadata.translation.z - metadata.size.z
				};

				metadata.end = {
					x: metadata.translation.z + metadata.size?.z,
					y: metadata.translation.z + metadata.size?.z,
					z: metadata.translation.z + metadata.size?.z
				};
			}
		}
	}

	public parseResultFile(
		content: string
	): { metadata: ResultFileMetadata; results: Page1D | Page2D } | undefined {
		if (content == '') {
			return undefined;
		}

		// file header should look like this (3rd line may be different):
		//
		// # mesh name: <meshName>
		// # primitive scorer name: <scorerName>
		// # iX, iY, iZ, total(value) [percm2], total(val^2), entry
		//
		// then, csv data follows

		const lines = content.split('\n');

		if (lines.at(-1) === '') {
			lines.pop();
		}

		const numColumns = lines[2].split(',').length;

		const columns: string[][] = Array.from({ length: numColumns }).map(_ => []);

		for (const line of lines.slice(3)) {
			line.split(',').forEach((val, i) => columns[i].push(val));
		}

		const numUniqueValues = columns.slice(0, 3).map(col => new Set(col).size);
		const dimensionMask = numUniqueValues.map(n => n > 1);

		const numDimensions = dimensionMask.reduce((acc, v) => acc + (v ? 1 : 0), 0);

		switch (numDimensions) {
			case 1:
				return this.parse1DResultFile(dimensionMask, lines.slice(0, 3), columns);
			case 2:
				return this.parse2DResultFile(dimensionMask, lines.slice(0, 3), columns);
			default:
				console.warn(`Results with dim == ${numDimensions} are unsupported`);

				return undefined;
		}
	}

	private parse1DResultFile(
		dimensionMask: boolean[],
		header: string[],
		columns: string[][]
	): { metadata: ResultFileMetadata; results: Page1D } {
		const meshName = header[0].split(' ').at(-1)!;
		const scorerName = header[1].split(' ').at(-1)!;

		columns = this.getAxisValuesFromBins(meshName, dimensionMask, columns);

		const xDataColumn = dimensionMask.findIndex(n => n);
		const xDataName = header[2].substring(2).split(',')[xDataColumn]; // substring to remove "# " comment character

		return {
			metadata: {
				dimensions: 1,
				meshName,
				scorerName
			},
			results: {
				name: scorerName,
				dimensions: 1,
				axisDim1: {
					name: xDataName,
					unit: 'cm',
					values: columns[xDataColumn].map(v => parseFloat(v))
				},
				data: {
					name: scorerName,
					unit: this.getUnit(header[2], true),
					values: columns[3].map(v => parseFloat(v) / this.numPrimaries)
				}
			}
		};
	}

	private parse2DResultFile(
		dimensionMask: boolean[],
		header: string[],
		columns: string[][]
	): { metadata: ResultFileMetadata; results: Page2D } {
		const meshName = header[0].split(' ').at(-1)!;
		const scorerName = header[1].split(' ').at(-1)!;

		// there are 2 columns, and they store all combinations of bin numbers
		// 1 1
		// 1 2
		// 1 3
		// 2 1
		// 2 2
		// 2 3
		// we want only unique, ascending values: (y) 1 2 / (x) 1 2 3

		columns = this.getAxisValuesFromBins(meshName, dimensionMask, columns);

		// x column comes after y to match what JsRootGraph2D expects when accessing data as consecutive 1d array
		// because of that, x = findLastIndex, y = findIndex
		const xDataColumn = dimensionMask.findLastIndex(n => n);
		const xDataName = header[2].substring(2).split(',')[xDataColumn]; // substring(2) to remove "# " comment character

		// store only unique, ascending values
		const xDataValues = [parseFloat(columns[xDataColumn][0])];
		columns[xDataColumn]
			.map(v => parseFloat(v))
			.forEach(v => {
				if (v > xDataValues.at(-1)!) xDataValues.push(v);
			});

		const yDataColumn = dimensionMask.findIndex(n => n);
		const yDataName = header[2].substring(2).split(',')[yDataColumn]; // substring(2) to remove "# " comment character

		// store only unique, ascending values
		const yDataValues = [parseFloat(columns[yDataColumn][0])];
		columns[yDataColumn]
			.map(v => parseFloat(v))
			.forEach(v => {
				if (v > yDataValues.at(-1)!) yDataValues.push(v);
			});

		return {
			metadata: {
				dimensions: 2,
				meshName,
				scorerName
			},
			results: {
				name: scorerName,
				dimensions: 2,
				axisDim1: {
					name: xDataName,
					unit: 'cm',
					values: xDataValues
				},
				axisDim2: {
					name: yDataName,
					unit: 'cm',
					values: yDataValues
				},
				data: {
					name: scorerName,
					unit: this.getUnit(header[2], true),
					values: columns[3].map(v => parseFloat(v) / this.numPrimaries)
				}
			}
		};
	}

	/**
	 * Replaces bin values with actual axes scale that is equal to detector dimensions.
	 * The dimensions come from the data parsed by this.parseMacroFile() that needs to be run first.
	 */
	private getAxisValuesFromBins(
		meshName: string,
		dimensionsMask: boolean[],
		binsColumns: string[][]
	): string[][] {
		if (!this.scorersMetadata.hasOwnProperty(meshName)) {
			return binsColumns;
		}

		let numBins = [1, 1, 1];
		let startValues = [0, 0, 0];
		let endValues = [0, 0, 0];

		const metadata = this.scorersMetadata[meshName];

		if (metadata.type === 'box') {
			// columns:
			// iX, iY, iZ, total(value) [percm2], total(val^2), entry
			// First 3 store bin numbers

			if (dimensionsMask[0]) {
				numBins[0] = metadata.binsAlongAxis.x;
				startValues[0] = metadata.start.x;
				endValues[0] = metadata.end.x;
			}

			if (dimensionsMask[1]) {
				numBins[1] = metadata.binsAlongAxis.y;
				startValues[1] = metadata.start.y;
				endValues[1] = metadata.end.y;
			}

			if (dimensionsMask[2]) {
				numBins[2] = metadata.binsAlongAxis.z;
				startValues[2] = metadata.start.z;
				endValues[2] = metadata.end.z;
			}
		}

		if (metadata.type === 'cylinder') {
			// columns:
			// iZ, iPHI, iR, total(value) [percm2], total(val^2), entry
			// we care only for iZ and iR

			if (dimensionsMask[0]) {
				numBins[0] = metadata.binsAlongAxis.z;
				startValues[0] = metadata.start.z;
				endValues[0] = metadata.end.z;
			}

			if (dimensionsMask[2]) {
				numBins[2] = metadata.binsAlongAxis.r;
				startValues[2] = metadata.start.r;
				endValues[2] = metadata.end.r;
			}
		}

		// For each plot dimensions (>1 bin), replace bin number
		// with world coordinate for position in the detector
		//
		// 4 bins, o -> calculated world coordinate for the given bin:
		// |---o---|---o---|---o---|---o---|
		let span: number, offsetFraction: number;

		for (const i in dimensionsMask) {
			if (!dimensionsMask[i]) {
				continue;
			}

			span = endValues[i] - startValues[i];

			for (let j = 0; j < binsColumns[i].length; j++) {
				offsetFraction = (parseFloat(binsColumns[i][j]) - 0.5) / numBins[i];
				binsColumns[i][j] = `${startValues[i] + offsetFraction * span}`;
			}
		}

		return binsColumns;
	}

	private getUnit(header: string, perPrimary: boolean) {
		const valueColumnHeader = header.split(',').at(3) ?? '';
		const unit =
			Array.from(valueColumnHeader.matchAll(VALUE_HEADER_UNIT_REGEX)).at(0)?.at(1) ?? '?';

		return perPrimary ? `${unit}/prim` : unit;
	}
}
