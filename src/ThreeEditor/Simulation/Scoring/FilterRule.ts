import { MathUtils } from 'three';

import {
	F_Keyword,
	I_Keyword,
	ID_Keyword,
	isValidID,
	Keyword,
	Operator,
	ParticleId
} from '../../../types/SimulationTypes/DetectTypes/DetectRuleTypes';

//https://stackoverflow.com/questions/48757095/typescript-class-composition

export type FloatRuleJSON = {
	uuid: string;
	keyword: F_Keyword;
	operator: Operator;
	value: number;
};

export type IntRuleJSON = {
	uuid: string;
	keyword: I_Keyword;
	operator: Operator;
	value: number;
};

export type IDRuleJSON = {
	uuid: string;
	keyword: ID_Keyword;
	operator: Operator;
	value: ParticleId;
};

export type RuleJSON = {
	uuid: string;
	keyword: Keyword;
	operator: Operator;
	value: number;
};

export abstract class FilterRule {
	uuid: string;
	operator: Operator;
	abstract keyword: Keyword;
	abstract value: number;

	constructor(operator: Operator) {
		this.uuid = MathUtils.generateUUID();
		this.operator = operator;
	}

	abstract toSerialized(): RuleJSON;
	abstract duplicate(): FilterRule;
}

export class FloatRule extends FilterRule {
	keyword: F_Keyword;
	isFloatRule: true = true;
	private _value: number;
	set value(value: number) {
		const precision = 100;
		this._value = Math.round((value + Number.EPSILON) * precision) / precision;
	}

	get value(): number {
		return this._value;
	}

	constructor({ keyword, operator, value }: Omit<FloatRuleJSON, 'uuid'>) {
		super(operator);
		this.keyword = keyword;
		this._value = value;
	}

	toSerialized(): FloatRuleJSON {
		const { uuid, keyword, operator, _value: value } = this;

		return { uuid, keyword, operator, value };
	}

	static fromSerialized(json: FloatRuleJSON): FloatRule {
		const rule = new FloatRule(json);
		rule.uuid = json.uuid;

		return rule;
	}

	duplicate(): FloatRule {
		return new FloatRule(this.toSerialized());
	}
}

export class IntRule extends FilterRule {
	keyword: I_Keyword;
	isIntRule: true = true;
	private _value: number;
	set value(value: number) {
		this._value = Math.floor(value);
	}

	get value(): number {
		return this._value;
	}

	constructor({ keyword, operator, value }: Omit<IntRuleJSON, 'uuid'>) {
		super(operator);
		this.keyword = keyword;
		this._value = value;
	}

	toSerialized(): IntRuleJSON {
		const { uuid, keyword, operator, _value: value } = this;

		return { uuid, keyword, operator, value };
	}

	static fromSerialized(json: IntRuleJSON): IntRule {
		const rule = new IntRule(json);
		rule.uuid = json.uuid;

		return rule;
	}

	duplicate(): IntRule {
		return new IntRule(this.toSerialized());
	}
}

export class IDRule extends FilterRule {
	keyword: ID_Keyword;
	isIDRule: true = true;
	private _value: ParticleId;
	set value(value: ParticleId) {
		const id = Math.floor(value);
		this._value = isValidID(id) ? id : 1;
	}

	get value(): ParticleId {
		return this._value;
	}

	constructor({ keyword, operator, value }: Omit<IDRuleJSON, 'uuid'>) {
		super(operator);
		this.keyword = keyword;
		this._value = value;
	}

	toSerialized(): IDRuleJSON {
		const { uuid, keyword, operator, _value: value } = this;

		return { uuid, keyword, operator, value };
	}

	static fromSerialized(json: IDRuleJSON): IDRule {
		const rule = new IDRule(json);
		rule.uuid = json.uuid;

		return rule;
	}

	duplicate(): IDRule {
		return new IDRule(this.toSerialized());
	}
}

export const isIDRule = (rule: unknown): rule is IDRule => rule instanceof IDRule;
export const isFloatRule = (rule: unknown): rule is FloatRule => rule instanceof FloatRule;
export const isIntRule = (rule: unknown): rule is IntRule => rule instanceof IntRule;
