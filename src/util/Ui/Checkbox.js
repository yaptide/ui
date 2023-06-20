import { LABEL_MARGIN, LABEL_WIDTH } from './Uis.js';
import { UICheckbox, UIRow, UISelect, UIText } from '../../ThreeEditor/js/libs/ui.js';
import { createNumberInput } from './Number.js';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *		text?: string,
 *		value?: boolean,
 *		update?: ()=> void,
 *		}} params
 * @return {[UIRow, UICheckbox, UIText]}
 */
export function createRowCheckbox(params) {
	const { text = 'Label', value = false, update = () => {} } = params;

	const row = new UIRow();
	const checkbox = new UICheckbox(value).onChange(update);
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);
	row.add(label, checkbox);
	return [row, checkbox, label];
}

/**
 * @param {{
 *		text?: string,
 *		value?: [boolean,number],
 *		update?: ()=> void,
 *		precision?: number
 * 		min?: number,
 * 		max?: number,
 * 		step?: number,
 *
 * 	}} params
 * @return {[UIRow, UICheckbox, UINumber, UIText]}
 */
export function createRowConditionalNumber(params) {
	const { text = 'Label', value = [false, 0], update = () => {} } = params;

	const row = new UIRow();
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);
	const checkbox = new UICheckbox(value[0]).onChange(update);
	const input = createNumberInput({ ...params, value: value[1], update });
	row.add(label, checkbox, input);
	return [row, checkbox, input, label];
}

/**
 * @param {{
 *		text?: string,
 *		value?: [boolean,string],
 *		update?: ()=> void,
 * 		options?: {[key:string]:string}
 * 	}} params
 * @return {[UIRow, UICheckbox, UISelect, UIText]}
 */
export function createRowConditionalSelect(params) {
	const { text = 'Label', value = [false, ''], options = {}, update = () => {} } = params;

	const row = new UIRow();
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);
	const checkbox = new UICheckbox(value[0]).onChange(update);
	const select = new UISelect(options).setValue(value[1]).onChange(update);
	row.add(label, checkbox, select);
	return [row, checkbox, select, label];
}
