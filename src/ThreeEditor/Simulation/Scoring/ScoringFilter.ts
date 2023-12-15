import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';
import {
	FilterRule,
	FloatRule,
	FloatRuleJSON,
	IDRule,
	IDRuleJSON,
	IntRule,
	IntRuleJSON,
	RuleJSON
} from './FilterRule';

export type FilterJSON = Omit<
	SimulationElementJSON & {
		rules: RuleJSON[];
	},
	never
>;

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

	clear(): this {
		return this;
	}

	toJSON(): FilterJSON {
		return { ...super.toJSON(), rules: [] };
	}

	fromJSON(json: FilterJSON): this {
		return this;
	}

	static fromJSON(editor: YaptideEditor, json: FilterJSON): ScoringFilter {
		return new ScoringFilter(editor).fromJSON(json);
	}

	toString(): string {
		return '';
	}

	duplicate(): ScoringFilter {
		return new ScoringFilter(this.editor);
	}
}

export const isScoringFilter = (x: unknown): x is ScoringFilter => x instanceof ScoringFilter;
