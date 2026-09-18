import { PARTICLE_CATALOGUE } from '../../../types/ParticleCatalogue';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { ScoringFilter } from './ScoringFilter';

export type ParticleFilterJSON = Omit<
	SimulationElementJSON & {
		particle: {
			pdg: number;
		};
	},
	never
>;

export function isParticleFilterJSON(filter: any): filter is ParticleFilterJSON {
	return filter && typeof filter.particle === 'object' && filter.particle !== null;
}

export class ParticleFilter extends ScoringFilter {
	particleData: { pdg: number };

	constructor(editor: YaptideEditor) {
		super(editor);
		this.particleData = { pdg: 2212 };
	}

	clear(): this {
		this.particleData = { pdg: 2212 };
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
		const particleName =
			PARTICLE_CATALOGUE.find(p => p.pdg === particleData.pdg)?.displayName ?? 'Unknown';

		return `[${uuid}]\n${name}\n${particleName}`;
	}

	duplicate(): ParticleFilter {
		const duplicated = new ParticleFilter(this.editor);

		duplicated.name = this.name;

		duplicated.particleData = this.particleData;

		return duplicated;
	}
}

export const isParticleFilter = (x: unknown): x is ParticleFilter => x instanceof ParticleFilter;
