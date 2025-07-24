import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElement } from '../Base/SimulationElement';
import { CustomFilterJSON } from './CustomFilter';
import { FilterRule } from './FilterRule';
import { GeantScoringFilterJSON } from './GeantScoringFilter';
import { ParticleFilterJSON } from './ParticleFilter';

export type FilterJSON = CustomFilterJSON | ParticleFilterJSON | GeantScoringFilterJSON;

export class ScoringFilter extends SimulationElement implements SerializableState<FilterJSON> {
	readonly isFilter: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;

	constructor(editor: YaptideEditor, rules: FilterRule[] = []) {
		super(editor, 'Filter', 'Filter');
		this.parent = null;
	}

	toSerialized(): FilterJSON {
		return null as never;
	}

	fromSerialized(json: FilterJSON): this {
		return this;
	}

	clear(): this {
		return this;
	}

	toString(): string {
		return '';
	}

	duplicate(): ScoringFilter {
		return new ScoringFilter(this.editor);
	}
}

export const isScoringFilter = (x: unknown): x is ScoringFilter => x instanceof ScoringFilter;
