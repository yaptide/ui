import { MathUtils } from 'three';
import { Editor } from '../../js/Editor';
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

export type FilterJSON = {
	uuid: string;
	name: string;
	rules: RuleJSON[];
};

export class DetectFilter {
	uuid: string;
	name: string;
	type: string;
	private rules: Record<string, FilterRule>;
	private editor: Editor;

	constructor(editor: Editor, rules: FilterRule[] = []) {
		this.uuid = MathUtils.generateUUID();
		this.editor = editor;
		this.name = 'MyFilter';
		this.type = 'Filter';
		this.rules = {};
		rules.forEach(rule => this.addRule(rule));
	}

	addRule(rule: FilterRule): void {
		this.rules[rule.uuid] = rule;
	}

	updateRule(ruleUuid: string, ruleData: Partial<RuleJSON>): void {
		const rule = this.rules[ruleUuid];
		if (rule) {
			Object.assign(rule, ruleData);
		}
	}

	findAndUpdateRule(ruleUuid: string, ruleData: RuleJSON): void {
		let rule = this.getRuleByUuid(ruleUuid);
		if (rule) {
			Object.assign(rule, ruleData);
		} else {
			rule = this.createRule(ruleData);
			this.addRule(rule);
		}
	}

	getRuleByUuid(uuid: string): FilterRule {
		return this.rules[uuid];
	}

	removeRule(ruleUuid: string): void {
		delete this.rules[ruleUuid];
	}

	clear(): void {
		this.rules = {};
	}

	createRule(json: RuleJSON): FilterRule {
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
		const { uuid, name, rules } = this;
		return { uuid, name, rules: Object.values(rules).map(rule => rule.toJSON()) };
	}

	static fromJSON(editor: Editor, json: FilterJSON): DetectFilter {
		const filter = new DetectFilter(editor);
		filter.uuid = json.uuid;
		filter.name = json.name;
		json.rules.forEach(ruleJson => {
			const rule = filter.createRule(ruleJson);
			rule.uuid = ruleJson.uuid;
		});
		return filter;
	}

	toString(): string {
		const { uuid, name, rules } = this;
		return `[${uuid}]\n${name}\n${Object.values(rules)
			.map(rule => `    ${rule.toString()}`)
			.join('\n')}}`;
	}
}

export const isDetectFilter = (x: unknown): x is DetectFilter => x instanceof DetectFilter;
