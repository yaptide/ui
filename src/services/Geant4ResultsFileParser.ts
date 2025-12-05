import { Page1D, Page2D } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { FilterType } from '../ThreeEditor/Simulation/Scoring/GeantScoringFilter';
import { FilterJSON } from '../ThreeEditor/Simulation/Scoring/ScoringFilter';

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

interface CYL {
	z: number;
	r: number;
}

interface ScorerMetadata<T extends 'box' | 'cylinder'> {
	type: T;
	translation: XYZ;
	binsAlongAxis: T extends 'box' ? XYZ : CYL;
	size: T extends 'box' ? XYZ : CYL;
	start: T extends 'box' ? XYZ : CYL;
	end: T extends 'box' ? XYZ : CYL;
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
	quantityFilterNames: { [key: string]: { [key: string]: { type: FilterType; name: string } } };
	editorJson?: EditorJson;

	constructor(numPrimaries: number, macroFile: string, editorJson?: EditorJson) {
		this.numPrimaries = numPrimaries;
		this.scorersMetadata = {};
		this.quantityFilterNames = {};
		this.parseMacroFile(macroFile);
		this.editorJson = editorJson;
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
		let lastQuantity: string | undefined = undefined;
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
				this.scorersMetadata[meshName] = meshType === 'box' ? emptyBox() : emptyCylinder();
				this.quantityFilterNames[meshName] = {};
			}

			// Command:
			// /score/quantity/{type} {name}
			if (line.startsWith('/score/quantity')) {
				[, lastQuantity] = line.split(' ');
			}

			// Command:
			// /score/filter/{type} {name} {opts}
			// Should immediately follow a /score/quantity command
			if (line.startsWith('/score/filter') && lastQuantity) {
				const [cmd, filterName] = line.split(' ');
				this.quantityFilterNames[meshName!][lastQuantity] = {
					type: cmd.split('/').at(-1)! as FilterType,
					name: filterName
				};
			}

			// Command:
			// /score/mesh/translate/xyz <x> <y> <z> cm
			// defaults to 0, 0, 0
			if (line.startsWith('/score/mesh/translate/xyz') && meshName) {
				const [, x, y, z] = line.split(' ');
				this.scorersMetadata[meshName].translation = {
					x: parseFloat(x),
					y: parseFloat(y),
					z: parseFloat(z)
				};
			}

			// Command:
			// /score/mesh/boxSize <x> <y> <z> cm
			// uses half-widths!
			// defaults to 1, 1, 1
			if (line.startsWith('/score/mesh/boxSize') && meshName) {
				const [, x, y, z] = line.split(' ');
				this.scorersMetadata[meshName].size = {
					x: parseFloat(x),
					y: parseFloat(y),
					z: parseFloat(z)
				};
			}

			// Command:
			// /score/mesh/cylinderSize <r> <z> cm
			// uses half-widths for depth!
			// defaults to 1, 1
			if (line.startsWith('/score/mesh/cylinderSize') && meshName) {
				const [, r, z] = line.split(' ');
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
				const [, x, y, z] = line.split(' ');
				this.scorersMetadata[meshName].binsAlongAxis = {
					x: parseInt(x),
					y: parseInt(y),
					z: parseInt(z)
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
				const [, r, z] = line.split(' ');
				this.scorersMetadata[meshName].binsAlongAxis = {
					r: parseInt(r),
					z: parseInt(z)
				};
			}
		}

		for (let metadata of Object.values(this.scorersMetadata)) {
			if (metadata.type === 'cylinder') {
				metadata.start = { z: metadata.translation.z - metadata.size.z, r: 0 };
				metadata.end = { z: metadata.translation.z + metadata.size.z, r: metadata.size.r };
			} else if (metadata.type === 'box') {
				metadata.start = {
					x: metadata.translation.x - metadata.size.x,
					y: metadata.translation.y - metadata.size.y,
					z: metadata.translation.z - metadata.size.z
				};

				metadata.end = {
					x: metadata.translation.x + metadata.size.x,
					y: metadata.translation.y + metadata.size.y,
					z: metadata.translation.z + metadata.size.z
				};
			}
		}
	}

	public parseResultFile(
		content: string
	): { metadata: ResultFileMetadata; results: Page1D | Page2D } | undefined {
		if (content === '') {
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

		const columnNames = Geant4ResultsFileParser.getColumnNames(header);

		const dataColumn = dimensionMask.findIndex(n => n);
		const dataName = columnNames[dataColumn];

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
					name: dataName,
					unit: 'cm',
					values: columns[dataColumn].map(v => parseFloat(v))
				},
				data: {
					name: scorerName,
					unit: Geant4ResultsFileParser.getUnit(header[2], true),
					values: columns[3].map(v => parseFloat(v) / this.numPrimaries)
				},
				filterRef: this.createFilterRef(meshName, scorerName)
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

		let columnNames = Geant4ResultsFileParser.getColumnNames(header);

		// column a comes after b to match what JsRootGraph2D expects when accessing data as consecutive 1d array
		// because of that, a = findLastIndex, b = findIndex
		let aDataColumn = dimensionMask.findLastIndex(n => n);
		let bDataColumn = dimensionMask.findIndex(n => n);
		let aDataName = columnNames[aDataColumn];
		let bDataName = columnNames[bDataColumn];

		let columnsWithAxisValues = this.getAxisValuesFromBins(meshName, dimensionMask, columns);

		// For the plots to look similar to other simulators, we need to swap the axes and the values associated
		// changing
		// 0 0 0 1 1 1
		// 0 1 2 0 1 2
		// into
		// 0 0 1 1 2 2
		// 0 1 0 1 0 1
		const aBins = parseInt(columns[aDataColumn].at(-1)!) + 1;
		const bBins = parseInt(columns[bDataColumn].at(-1)!) + 1;
		columnsWithAxisValues = Geant4ResultsFileParser.swapColumns(
			columnsWithAxisValues,
			bDataColumn,
			aDataColumn,
			bBins,
			aBins
		);
		[aDataName, bDataName] = [bDataName, aDataName];

		let aDataValuesAll = columnsWithAxisValues[aDataColumn]
			.map(v => parseFloat(v))
			.toSorted((a, b) => a - b);
		let aDataValues = [aDataValuesAll[0]];
		aDataValuesAll.forEach(v => {
			if (v > aDataValues.at(-1)!) {
				aDataValues.push(v);
			}
		});

		let bDataValuesAll = columnsWithAxisValues[bDataColumn]
			.map(v => parseFloat(v))
			.toSorted((a, b) => a - b);
		let bDataValues = [bDataValuesAll[0]];
		bDataValuesAll.forEach(v => {
			if (v > bDataValues.at(-1)!) {
				bDataValues.push(v);
			}
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
					name: aDataName,
					unit: 'cm',
					values: aDataValues
				},
				axisDim2: {
					name: bDataName,
					unit: 'cm',
					values: bDataValues
				},
				data: {
					name: scorerName,
					unit: Geant4ResultsFileParser.getUnit(header[2], true),
					values: columnsWithAxisValues[3].map(v => parseFloat(v) / this.numPrimaries)
				},
				filterRef: this.createFilterRef(meshName, scorerName)
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
		binsColumns = Array.from(binsColumns, row => Array.from(row)); // deepcopy

		if (!this.scorersMetadata.hasOwnProperty(meshName)) {
			return Array.from(binsColumns, row => Array.from(row));
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

	private static getColumnNames(header: string[]): string[] {
		let names = header[2].substring(2).split(', ');

		for (const i in names) {
			if (names[i].startsWith('i')) {
				names[i] = `Position (${names[i].substring(1)})`;
			}
		}

		return names;
	}

	static swapColumns(
		array2d: string[][],
		a: number,
		b: number,
		aBins: number,
		bBins: number
	): string[][] {
		if (aBins === 1 || bBins === 1) {
			return this.swapIndices(
				Array.from(array2d, row => Array.from(row)),
				a,
				b
			);
		}

		let src: number, dst: number, row: string[];
		let newArray2d = Array.from({ length: array2d.length }, (): string[] =>
			Array.from({ length: array2d[0].length })
		);

		for (let ib = 0; ib < bBins; ib++) {
			for (let ia = 0; ia < aBins; ia++) {
				src = ia * bBins + ib;
				dst = ib * aBins + ia;

				row = array2d.map(row => row[src]);
				row = Geant4ResultsFileParser.swapIndices(row, a, b);

				for (let i in row) {
					newArray2d[i][dst] = row[i];
				}
			}
		}

		return newArray2d;
	}

	static swapIndices<T>(array: T[], a: number, b: number): T[] {
		const tmp: T = array[a];
		array[a] = array[b];
		array[b] = tmp;

		return array;
	}

	private static getUnit(header: string, perPrimary: boolean) {
		const valueColumnHeader = header.split(',').at(3) ?? '';
		const unit =
			Array.from(valueColumnHeader.matchAll(VALUE_HEADER_UNIT_REGEX)).at(0)?.at(1) ?? '?';

		return perPrimary ? `${unit}/prim` : unit;
	}

	private createFilterRef(meshName: string, scorerName: string) {
		let filterRef: FilterJSON | undefined;

		if (this.editorJson) {
			const output = this.editorJson.scoringManager.outputs.find(o => o.name === meshName);
			const quantity = output?.quantities.find(q => q.name === scorerName);

			if (quantity === undefined) {
				console.warn(`Quantity ${scorerName} not found in Output ${output}.`);
			}

			filterRef = this.editorJson.scoringManager.filters.find(
				f => f.uuid === quantity?.filter
			);
		} else if (this.quantityFilterNames[meshName]?.[scorerName]) {
			filterRef = {
				type: 'Filter',
				uuid: '00000000-0000-0000-0000-000000000000',
				name: this.quantityFilterNames[meshName][scorerName].name,
				filterType: this.quantityFilterNames[meshName][scorerName].type,
				data: {
					particleTypes: [],
					kineticEnergyLow: 0,
					kineticEnergyHigh: 0,
					kineticEnergyUnit: ''
				}
			};
		}

		return filterRef;
	}
}
