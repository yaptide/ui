import { MathUtils } from 'three';
import { DetectFilter } from '../../../util/Detect/DetectFilter';
import { FilterRule, isFloatRule, isIDRule, isIntRule } from '../../../util/Detect/DetectRule';
import * as Rule from '../../../util/Detect/DetectRuleTypes';
import {
	createFullwidthButton,
	createRuleConfigurationRow,
	createRulesOutliner,
	hideUIElement,
	showUIElement
} from '../../../util/Ui/Uis';
import { SetFilterRuleCommand } from '../../commands/SetFilterRuleCommand';
import { Editor } from '../../Editor';
import { UIBreak, UIButton, UINumber, UIRow, UISelect } from '../../libs/ui';
import { UIOutliner } from '../../libs/ui.three';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectFilter extends ObjectAbstract {
	object?: DetectFilter;
	rule?: FilterRule;

	add: UIButton;
	addRow: UIRow;

	outliner: UIOutliner;

	ruleRow: UIRow;
	keywordSelect: UISelect;
	operatorSelect: UISelect;
	idSelect: UISelect;
	valueInput: UINumber;
	removeButton: UIButton;

	constructor(editor: Editor) {
		super(editor, 'Scoring rules');
		[this.addRow, this.add] = createFullwidthButton({
			text: 'Add rule',
			update: this.addRule.bind(this)
		});
		[this.outliner] = createRulesOutliner(editor, {
			update: this.updateSelectedRule.bind(this)
		});

		[
			this.ruleRow,
			this.keywordSelect,
			this.operatorSelect,
			this.idSelect,
			this.valueInput,
			this.removeButton
		] = createRuleConfigurationRow({
			update: this.update.bind(this),
			delete: this.deleteRule.bind(this),
			operators: Rule.OPERATOR_OPTIONS,
			options: Rule.KEYWORD_OPTIONS,
			particles: Rule.PARTICLE_OPTIONS
		});
		this.panel.add(this.addRow, this.outliner, new UIBreak(), this.ruleRow);
		editor.signals.detectFilterChanged.add(() =>
			this.object ? this.setObject(this.object) : null
		);
	}
	getRuleValue(rule: FilterRule): number {
		switch (true) {
			case isIDRule(rule):
				return this.idSelect.getValue();
			case isFloatRule(rule):
				return this.valueInput.getValue();
			case isIntRule(rule):
				return Math.floor(this.valueInput.getValue());
			default:
				console.warn('Unknown rule type');
				return 0;
		}
	}
	update(): void {
		const { object, rule } = this;
		if (!object || !rule) return;
		const ruleJson = {
			uuid: rule.uuid,
			keyword: this.keywordSelect.getValue(),
			operator: this.operatorSelect.getValue(),
			value: this.getRuleValue(rule)
		};
		this.editor.execute(new SetFilterRuleCommand(this.editor, object, ruleJson));
	}
	updateSelectedRule(): void {
		const { object } = this;
		if (!object) return;
		const rule = object.getRuleByUuid(this.outliner.getValue());
		if (rule) {
			object.selectedRule = rule.uuid;
			this.setRule(rule);
		} else {
			object.selectedRule = undefined;
			hideUIElement(this.ruleRow);
		}
	}
	deleteRule(): void {
		const { object, editor, rule } = this;
		if (!object || !rule) return;
		editor.execute(new SetFilterRuleCommand(editor, object));
	}
	setRule(rule: FilterRule): void {
		showUIElement(this.ruleRow, 'grid');
		this.rule = rule;
		this.outliner.setValue(rule.uuid);
		this.keywordSelect.setValue(rule.keyword);
		this.operatorSelect.setValue(rule.operator);
		switch (true) {
			case isIDRule(rule):
				hideUIElement(this.valueInput);
				showUIElement(this.idSelect);
				this.idSelect.setValue(rule.value);
				break;
			case isFloatRule(rule):
				showUIElement(this.valueInput);
				hideUIElement(this.idSelect);
				this.valueInput.setValue(rule.value);
				this.valueInput.setPrecision(5);
				this.valueInput.setUnit(Rule.RULE_UNITS[rule.keyword]);
				break;
			case isIntRule(rule):
				showUIElement(this.valueInput);
				hideUIElement(this.idSelect);
				this.valueInput.setValue(rule.value);
				this.valueInput.setPrecision(0);
				this.valueInput.setUnit(Rule.RULE_UNITS[rule.keyword]);
				break;
			default:
				console.warn('Unknown rule type');
				break;
		}
	}
	addRule(): void {
		const { object, editor } = this;
		if (!object) return;
		const ruleJson = {
			uuid: MathUtils.generateUUID(),
			keyword: 'AMASS',
			operator: 'less_than',
			value: 1
		};
		editor.execute(new SetFilterRuleCommand(editor, object, ruleJson));
	}
	setObject(object: DetectFilter): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		this.outliner.setOptions(object.rules);
		if (object.selectedRule) {
			const rule = object.getRuleByUuid(object.selectedRule);
			if (rule) {
				this.outliner.setValue(object.selectedRule);
				this.setRule(rule);
				this.updateSelectedRule();
			} else {
				object.selectedRule = undefined;
				hideUIElement(this.ruleRow);
			}
		} else {
			hideUIElement(this.ruleRow);
		}
	}
}
