import { Particle } from '../../../types/Particle';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { ScoringFilter } from './ScoringFilter';

export type ParticleFilterJSON = Omit<
	SimulationElementJSON & {
		particle: {
			id: number;
			name: string;
		};
	},
	never
>;

export function isParticleFilterJSON(filter: any): filter is ParticleFilterJSON {
	return filter && typeof filter.particle === 'object' && filter.particle !== null;
}

export class ParticleFilter extends ScoringFilter {
	particleData: Omit<Particle, 'massNumber'>;

	constructor(editor: YaptideEditor) {
		super(editor);
		this.particleData = { id: 2, name: 'Proton' };
	}

	clear(): this {
		this.particleData = { id: 2, name: 'Proton' };
		this.name = 'Filter';

		return this;
	}

	toSerialized(): ParticleFilterJSON {
		const { uuid, name, particleData: rules, type } = this;

		return { uuid, name, type, particle: this.particleData };
	}

	fromSerialized(json: ParticleFilterJSON) {
		this.clear();
		this.uuid = json.uuid;
		this.name = json.name;
		this.particleData = json.particle;

		return this;
	}

	static fromSerialized(editor: YaptideEditor, json: ParticleFilterJSON): ParticleFilter {
		return new ParticleFilter(editor).fromSerialized(json);
	}

	toString(): string {
		const { uuid, name, particleData } = this;

		return `[${uuid}]\n${name}\n${particleData.name}`;
	}

	duplicate(): ParticleFilter {
		const duplicated = new ParticleFilter(this.editor);

		duplicated.name = this.name;

		duplicated.particleData = this.particleData;

		return duplicated;
	}
}

export const isParticleFilter = (x: unknown): x is ParticleFilter => x instanceof ParticleFilter;
