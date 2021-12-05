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
			update: this.selectRule.bind(this)
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
			particles: Rule.PARTICLE_OPTIONS,
			sortFunc: Rule.KEYWORD_SORT_ORDER
		});
		this.panel.add(this.addRow, this.outliner, new UIBreak(), this.ruleRow);
		editor.signals.detectFilterChanged.add(() =>
			this.object ? this.setObject(this.object) : null
		);
	}

	getRuleValue(rule: FilterRule): number {
		switch (true) {
			case isIDRule(rule):
				return parseInt(this.idSelect.getValue());
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

	deleteRule(): void {
		const { object, editor, rule } = this;
		if (!object || !rule) return;
		editor.execute(new SetFilterRuleCommand(editor, object));
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

	selectRule(): void {
		const { object } = this;
		if (!object) return;
		const rule = object.getRuleByUuid(this.outliner.getValue());
		object.selectedRule = rule;
		if (rule) {
			this.setRule(rule);
		} else {
			this.outliner.setValue(null);
			this.rule = undefined;
			hideUIElement(this.ruleRow);
		}
	}

	updateSelectedRule(): void {
		const { rule } = this;
		if (!rule) return;
		this.valueInput.setUnit(Rule.RULE_UNITS[rule.keyword]);
		this.keywordSelect.setValue(rule.keyword);
		this.operatorSelect.setValue(rule.operator);
		this.idSelect.setValue(rule.value.toString());
		this.valueInput.setValue(rule.value);
		if (isIDRule(rule)) {
			showUIElement(this.idSelect);
			hideUIElement(this.valueInput);
		} else {
			hideUIElement(this.idSelect);
			showUIElement(this.valueInput);
			if (isFloatRule(rule)) this.valueInput.setPrecision(3);
			else this.valueInput.setPrecision(0);
		}
	}
	setRule(rule: FilterRule): void {
		showUIElement(this.ruleRow, 'grid');
		this.rule = rule;
		this.outliner.setValue(rule.uuid);
		this.updateSelectedRule();
	}
	setObject(object: DetectFilter): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		this.outliner.setOptions(object.rules);
		if (object.selectedRule) {
			const rule = object.selectedRule;
			if (rule) {
				this.outliner.setValue(object.selectedRule.uuid);
				this.setRule(rule);
			} else {
				object.selectedRule = undefined;
				hideUIElement(this.ruleRow);
			}
		} else {
			hideUIElement(this.ruleRow);
		}
	}
}
