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
} from './DetectRule';

export type FilterJSON = Omit<
	SimulationElementJSON & {
		rules: RuleJSON[];
	},
	never
>;

export class DetectFilter extends SimulationElement {
	private _rules: Record<string, FilterRule>;
	private _selectedRule?: string;
	readonly isFilter: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;

	private onObjectSelected(object: SimulationElement): void {
		this._selectedRule = undefined;
	}

	set selectedRule(rule: FilterRule | undefined) {
		this._selectedRule = rule?.uuid;
	}
	get selectedRule(): FilterRule | undefined {
		return this._selectedRule ? this._rules[this._selectedRule] : undefined;
	}

	constructor(editor: YaptideEditor, rules: FilterRule[] = []) {
		super(editor, 'Filter', 'Filter');
		this._rules = {};
		this.parent = null;
		rules.forEach(rule => this.addRule(rule));
		editor.signals.objectSelected.add(this.onObjectSelected.bind(this));
	}

	addRule(rule: FilterRule): void {
		this._rules[rule.uuid] = rule;
	}

	get rules(): FilterRule[] {
		return Object.values(this._rules);
	}

	updateOrCreateRule(json: RuleJSON): void {
		const { keyword } = json;
		let rule;
		switch (keyword) {
			case 'AMASS':
			case 'AMU':
			case 'E':
			case 'ENUC':
			case 'EAMU':
				rule = FloatRule.fromJSON(json as FloatRuleJSON);
				break;
			case 'A':
			case 'GEN':
			case 'NPRIM':
			case 'Z':
				rule = IntRule.fromJSON(json as IntRuleJSON);
				break;
			case 'ID':
				rule = IDRule.fromJSON(json as IDRuleJSON);
				break;
			default:
				throw new Error(`Invalid keyword: ${keyword}`);
		}
		this.addRule(rule);
		this.selectedRule = rule;
	}

	getRuleByUuid(uuid: string): FilterRule | undefined {
		return this._rules[uuid];
	}

	removeRule(uuid: string): void {
		delete this._rules[uuid];
		if (this.selectedRule?.uuid === uuid) this.selectedRule = undefined;
	}

	clear(): this {
		this._rules = {};
		this.name = 'Filter';
		return this;
	}

	createRule(json: Omit<RuleJSON, 'uuid'>): FilterRule {
		const { keyword } = json;
		let rule;
		switch (keyword) {
			case 'AMASS':
			case 'AMU':
			case 'E':
			case 'ENUC':
			case 'EAMU':
				rule = new FloatRule(json as FloatRuleJSON);
				break;
			case 'A':
			case 'GEN':
			case 'NPRIM':
			case 'Z':
				rule = new IntRule(json as IntRuleJSON);
				break;
			case 'ID':
				rule = new IDRule(json as IDRuleJSON);
				break;
			default:
				throw new Error(`Invalid keyword: ${keyword}`);
		}
		this.addRule(rule);
		return rule;
	}

	toJSON(): FilterJSON {
		const { uuid, name, _rules: rules, type } = this;
		return { uuid, name, type, rules: Object.values(rules).map(rule => rule.toJSON()) };
	}
	fromJSON(json: FilterJSON) {
		this.clear();
		this.uuid = json.uuid;
		this.name = json.name;
		json.rules.map(this.updateOrCreateRule.bind(this));
		return this;
	}

	static fromJSON(editor: YaptideEditor, json: FilterJSON): DetectFilter {
		return new DetectFilter(editor).fromJSON(json);
	}

	toString(): string {
		const { uuid, name, _rules: rules } = this;
		return `[${uuid}]\n${name}\n${Object.values(rules)
			.map(rule => `    ${rule.toString()}`)
			.join('\n')}}`;
	}
}

export const isDetectFilter = (x: unknown): x is DetectFilter => x instanceof DetectFilter;
