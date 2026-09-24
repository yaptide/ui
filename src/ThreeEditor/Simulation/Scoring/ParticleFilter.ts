import { PARTICLE_CATALOGUE } from '../../../types/ParticleCatalogue';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { ScoringFilter } from './ScoringFilter';

export type ParticleFilterJSON = Omit<
	SimulationElementJSON & {
		particle_PDG: number;
	},
	never
>;

export function isParticleFilterJSON(filter: any): filter is ParticleFilterJSON {
	return filter && typeof filter.particle_PDG === 'number';
}

export class ParticleFilter extends ScoringFilter {
	particle_PDG: number;

	constructor(editor: YaptideEditor) {
		super(editor);
		this.particle_PDG = 2212;
	}

	clear(): this {
		this.particle_PDG = 2212;
		this.name = 'Filter';

		return this;
	}

	toSerialized(): ParticleFilterJSON {
		const { uuid, name, type, particle_PDG } = this;

		return { uuid, name, type, particle_PDG };
	}

	fromSerialized(json: ParticleFilterJSON) {
		this.clear();
		this.uuid = json.uuid;
		this.name = json.name;
		this.particle_PDG = json.particle_PDG;

		return this;
	}

	static fromSerialized(editor: YaptideEditor, json: ParticleFilterJSON): ParticleFilter {
		return new ParticleFilter(editor).fromSerialized(json);
	}

	toString(): string {
		const { uuid, name, particle_PDG } = this;
		const particleName =
			PARTICLE_CATALOGUE.find(p => p.pdg === particle_PDG)?.displayName ?? 'Unknown';

		return `[${uuid}]\n${name}\n${particleName}`;
	}

	duplicate(): ParticleFilter {
		const duplicated = new ParticleFilter(this.editor);

		duplicated.name = this.name;

		duplicated.particle_PDG = this.particle_PDG;

		return duplicated;
	}
}

export const isParticleFilter = (x: unknown): x is ParticleFilter => x instanceof ParticleFilter;
