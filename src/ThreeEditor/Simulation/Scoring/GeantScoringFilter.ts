import { Particle } from '../../../types/Particle';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { ScoringFilter } from './ScoringFilter';

export type FilterType =
	| 'charged'
	| 'neutral'
	| 'particle'
	| 'kineticEnergy'
	| 'particleWithKineticEnergy';

type FilterData = {
	particleTypes: Particle[];
	kineticEnergyLow: number;
	kineticEnergyHigh: number;
	kineticEnergyUnit: string;
};

export type GeantScoringFilterJSON = Omit<
	SimulationElementJSON & {
		filterType: FilterType;
		data: FilterData;
	},
	never
>;

function getInitialFilterData() {
	return {
		particleTypes: [],
		kineticEnergyLow: 1,
		kineticEnergyHigh: 10,
		kineticEnergyUnit: 'MeV'
	};
}

export function isGeantScoringFilterJSON(filter: any): filter is GeantScoringFilterJSON {
	return filter && typeof filter.filterType === 'string' && typeof filter.data === 'object';
}

export class GeantScoringFilter extends ScoringFilter {
	filterType: FilterType;
	data: FilterData;

	constructor(editor: YaptideEditor) {
		super(editor);
		this.filterType = 'charged';
		this.data = getInitialFilterData();
	}

	clear(): this {
		this.filterType = 'charged';
		this.data = getInitialFilterData();
		this.name = 'Filter';

		return this;
	}

	toSerialized(): GeantScoringFilterJSON {
		const { uuid, name, filterType, data, type } = this;

		return { uuid, name, type, data, filterType };
	}

	fromSerialized(json: GeantScoringFilterJSON) {
		this.clear();
		this.uuid = json.uuid;
		this.name = json.name;
		this.filterType = json.filterType;
		this.data = json.data;

		return this;
	}

	static fromSerialized(editor: YaptideEditor, json: GeantScoringFilterJSON): GeantScoringFilter {
		return new GeantScoringFilter(editor).fromSerialized(json);
	}

	toString(): string {
		const { uuid, name, filterType } = this;

		return `[${uuid}]\n${name}\n${filterType}`;
	}

	duplicate(): GeantScoringFilter {
		const duplicated = new GeantScoringFilter(this.editor);

		duplicated.name = this.name;
		duplicated.filterType = this.filterType;
		duplicated.data = { ...this.data };

		return duplicated;
	}
}

export const isGeantScoringFilter = (x: unknown): x is GeantScoringFilter =>
	x instanceof GeantScoringFilter;
