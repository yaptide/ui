import { UIButton, UINumber, UIRow, UISelect } from '../../js/libs/ui';
import { UIOutliner } from '../../js/libs/ui.three';
import { FilterRule } from '../Detect/DetectRule';
import * as Rule from '../Detect/DetectRuleTypes';
import { FONT_SIZE } from './Uis';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 *
 */

/**
 * @param {Editor} editor
 * @param {{
 *      update?: ()=> void,
 *      }} params
 * @return {[UIOutliner]}
 */
export function createRulesOutliner(editor, params) {
	const { update = () => {} } = params;
	const outliner = new UIOutliner(editor);
	outliner.setId('rules-outliner');
	outliner.setHeight('120px');
	outliner._setOptions = outliner.setOptions;
	outliner.setOptions = function (rules) {
		outliner._setOptions(rules.map(buildOption));
	};
	outliner.onChange(update);
	return [outliner];
}

/**
 *
 * @param {FilterRule} rule
 * @returns {string}
 */
function buildHTML(rule) {
	const description = Rule.getDescription(rule.keyword);
	return `${description}`;
}

/**
 *
 * @param {FilterRule} rule
 * @returns {HTMLDivElement}
 */
function buildOption(rule) {
	const option = document.createElement('div');
	option.style.padding = '6px';

	option.draggable = false;
	option.innerHTML = buildHTML(rule);
	option.value = rule.uuid;

	return option;
}

/**
 * @param {Editor} editor
 * @param {{
 *      update: ()=> void,
 * 		options: Object,
 * 		sortFunc: (a: string, b: string)=> number,
 * 		operators: Object,
 * 		particles: Object,
 * 		delete: ()=> void
 *      }} params
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
	const deleteButton = new UIButton('X').onClick(deleteRule);
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
