import { ParticleType } from '../../components/Select/ParticleSelect';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { RuleJSON } from './FilterRule';
import { ScoringFilter } from './ScoringFilter';

export type FilterJSON = Omit<
	SimulationElementJSON & {
		rules: RuleJSON[];
	},
	never
>;

export class ParticleFilter extends ScoringFilter {
	private particleType: ParticleType;

	constructor(editor: YaptideEditor) {
		super(editor);
		this.particleType = { id: 1, name: 'Proton' };
	}

	public getParticleType(): ParticleType {
		return this.particleType;
	}

	public setParticleType(particleType: ParticleType): void {
		this.particleType = particleType;
	}
}

export const isParticleFilter = (x: unknown): x is ParticleFilter => x instanceof ParticleFilter;
