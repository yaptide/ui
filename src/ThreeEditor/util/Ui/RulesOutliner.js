import { UIRow } from '../../js/libs/ui';
import { UIOutliner } from '../../js/libs/ui.three';
import { LABEL_MARGIN, LABEL_WIDTH } from './Uis';
import { escapeHTML } from '../escapeHTML';
import { FilterRule } from '../Detect/DetectRule';
import * as Rule from '../Detect/DetectRuleTypes';

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
	const operator = Rule.getOperator(rule.operator);
	const value = rule.isIDRule ? Rule.getParticle(rule.value)[1] : `${rule.value}`;
	const decoration = Rule.textDecoration(rule.isIDRule ? rule.value : null);
	return `${description} ${operator} <span ${
		decoration ? `style="text-decoraction: ${decoration};"` : ''
	}>${value}</span>`;
}

function buildOption(rule) {
	const option = document.createElement('div');
	option.setPadding('0 2px');
	option.draggable = false;
	option.innerHTML = buildHTML(rule);
	option.value = rule.uuid;

	return option;
}
