import {
	UIButton,
	UICheckbox,
	UIDiv,
	UINumber,
	UIRow,
	UISelect,
	UIText
} from '../../ThreeEditor/js/libs/ui';
import { UIOutliner } from '../../ThreeEditor/js/libs/ui.three';
import * as Scoring from '../../ThreeEditor/Simulation/Scoring/ScoringOutputTypes';
import * as Rule from '../../types/SimulationTypes/DetectTypes/DetectRuleTypes';
import { FONT_SIZE } from './Uis';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 * @typedef {import('../Detect/DetectRule').FilterRule} FilterRule
 *
 */

/**
 * @param {Editor} editor
 * @param {{
 *		update?: ()=> void,
 *		}} params
 * @return {[UIOutliner]}
 */
export function createModifiersOutliner(editor, params) {
	const { update = () => {} } = params;
	const outliner = new UIOutliner(editor);
	outliner.setId('modifiers-outliner');
	outliner.setHeight('120px');
	outliner._setOptions = outliner.setOptions;
	outliner.setOptions = function (modifier) {
		outliner._setOptions(
			modifier.map(modifier => {
				const option = document.createElement('div');
				option.style.padding = '6px';

				option.draggable = false;
				option.innerHTML = Scoring.getModifierDescription(modifier.diffType);
				option.value = modifier.uuid;

				return option;
			})
		);
	};
	outliner.onChange(update);

	return [outliner];
}

/**
 * @param {Editor} editor
 * @param {{
 *		update?: ()=> void,
 *		}} params
 * @return {[UIOutliner]}
 */
export function createRulesOutliner(editor, params) {
	const { update = () => {} } = params;
	const outliner = new UIOutliner(editor);
	outliner.setId('rules-outliner');
	outliner.setHeight('120px');
	outliner._setOptions = outliner.setOptions;
	outliner.setOptions = function (rules) {
		outliner._setOptions(
			rules.map(rule => {
				const option = document.createElement('div');
				option.style.padding = '6px';

				option.draggable = false;
				option.innerHTML = Rule.getDescription(rule.keyword);
				option.value = rule.uuid;

				return option;
			})
		);
	};
	outliner.onChange(update);

	return [outliner];
}

/**
 * @param {Editor} editor
 * @param {{
 *		update: ()=> void,
 * 		options: Object,
 * 		delete: ()=> void
 *		}} params
 * @return {[UIRow, UISelect, UINumber, UINumber, UINumber, UICheckbox, UIButton]}
 */
export function createDifferentialConfigurationRow(params) {
	const { update, delete: deleteRule, options } = params;

	const grid = new UIDiv();
	grid.dom.style.display = 'grid';

	function createRow(name, element) {
		const row = new UIRow();
		row.dom.style.gridTemplateColumns = '2fr 1fr';
		row.dom.style.display = 'grid';
		const label = new UIText(name).setFontSize(FONT_SIZE);
		row.add(label, element);
		grid.add(row);
	}

	const keywordSelect = new UISelect().setFontSize(FONT_SIZE).onChange(update);
	keywordSelect.setOptions(options);
	createRow('Diff. quantity', keywordSelect);
	const lowerLimit = new UINumber().setPadding('2px 4px').onChange(update).setWidth('100%');
	createRow('Lower limit', lowerLimit);
	const upperLimit = new UINumber().setPadding('2px 4px').onChange(update).setWidth('100%');
	createRow('Upper limit', upperLimit);
	const binsNumber = new UINumber()
		.setPadding('2px 4px')
		.onChange(update)
		.setWidth('100%')
		.setRange(1, 50000)
		.setPrecision(0);
	createRow('Bins number', binsNumber);
	const isLog = new UICheckbox().onChange(update);
	createRow('Logarithmic scale', isLog);

	const deleteButton = new UIButton('✖').onClick(deleteRule);
	createRow('', deleteButton);

	return [grid, keywordSelect, lowerLimit, upperLimit, binsNumber, isLog, deleteButton];
}

/**
 * @param {Editor} editor
 * @param {{
 *		update: ()=> void,
 * 		options: Object,
 * 		sortFunc: (a: string, b: string)=> number,
 * 		operators: Object,
 * 		particles: Object,
 * 		delete: ()=> void
 *		}} params
 * @return {[UIRow, UISelect, UISelect, UISelect, UINumber, UIButton]}
 */
export function createRuleConfigurationRow(params) {
	const { update, delete: deleteRule, options, operators, particles, sortFunc } = params;
	const row = new UIRow();
	row.dom.style.gridTemplateColumns = '1fr 35px 3fr 25px';
	row.dom.style.display = 'grid';
	const keywordSelect = new UISelect().setFontSize(FONT_SIZE).onChange(update);
	keywordSelect.setOptions = setOptionsSorted.bind(keywordSelect);
	keywordSelect.setOptions(options, sortFunc);
	const operatorSelect = new UISelect()
		.setOptions(operators)
		.setFontSize(FONT_SIZE)
		.onChange(update);

	const idSelect = new UISelect()
		.setFontSize(FONT_SIZE)
		.onChange(update)
		.setOptions(particles)
		.setWidth('100%');
	const valueInput = new UINumber().setPadding('2px 4px').onChange(update).setWidth('100%');
	const deleteButton = new UIButton('✖').onClick(deleteRule);
	row.add(keywordSelect, operatorSelect, idSelect, valueInput, deleteButton);

	return [row, keywordSelect, operatorSelect, idSelect, valueInput, deleteButton];
}

function setOptionsSorted(options, sortFunc) {
	const { value } = this.dom;

	while (this.dom.children.length > 0) this.dom.removeChild(this.dom.firstChild);

	Object.keys(options)
		.sort(sortFunc)
		.forEach(value => {
			const option = document.createElement('option');
			option.value = value;
			option.innerHTML = options[value];
			this.dom.appendChild(option);
		});
	this.dom.value = value;

	return this;
}
