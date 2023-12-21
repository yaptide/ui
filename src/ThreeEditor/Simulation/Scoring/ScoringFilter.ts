import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElement } from '../Base/SimulationElement';
import { CustomFilterJSON } from './CustomFilter';
import { FilterRule } from './FilterRule';
import { ParticleFilterJSON } from './ParticleFilter';

export type FilterJSON = CustomFilterJSON | ParticleFilterJSON;

export class ScoringFilter extends SimulationElement {
	readonly isFilter: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;

	constructor(editor: YaptideEditor, rules: FilterRule[] = []) {
		super(editor, 'Filter', 'Filter');
		this.parent = null;
	}

	toJSON(): FilterJSON {
		return null as never;
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
