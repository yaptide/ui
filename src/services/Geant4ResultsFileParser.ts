import { Page1D, Page2D } from '../JsRoot/GraphData';

const VALUE_HEADER_UNIT_REGEX = /\[(\w+)]/g;

export class Geant4ResultsFileParser {
	numPrimaries: number;

	constructor(numPrimaries: number) {
		this.numPrimaries = numPrimaries;
	}

	public parseResultFile(
		content: string
	): { metadata: any; results: Page1D | Page2D } | undefined {
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
	): { metadata: any; results: Page1D } {
		const meshName = header[0].split(' ').at(-1)!;
		const scorerName = header[1].split(' ').at(-1)!;

		const xDataColumn = dimensionMask.findIndex(n => n);
		const xDataName = header[2].split(',')[xDataColumn];

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
					unit: '',
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
	): { metadata: any; results: Page2D } {
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

		// x column comes after y so it matches what JsRootGraph2D expects when accessing data as consecutive 1d array
		// because of that, x = findLastIndex, y = findIndex
		const xDataColumn = dimensionMask.findLastIndex(n => n);
		const xDataName = header[2].split(',')[xDataColumn];

		// store only unique, ascending values
		const xDataValues = [parseFloat(columns[xDataColumn][0])];
		columns[xDataColumn]
			.map(v => parseFloat(v))
			.forEach(v => {
				if (v > xDataValues.at(-1)!) xDataValues.push(v);
			});

		const yDataColumn = dimensionMask.findIndex(n => n);
		const yDataName = header[2].split(',')[yDataColumn];

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
					unit: '',
					values: xDataValues
				},
				axisDim2: {
					name: yDataName,
					unit: '',
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

	private getUnit(header: string, perPrimary: boolean) {
		const valueColumnHeader = header.split(',').at(3) ?? '';
		const unit =
			Array.from(valueColumnHeader.matchAll(VALUE_HEADER_UNIT_REGEX)).at(0)?.at(1) ?? '?';

		return perPrimary ? `${unit}/prim` : unit;
	}
}
