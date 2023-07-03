import { UIInput, UIRow, UIText } from '../../ThreeEditor/js/libs/ui.js';
import { FONT_SIZE, INPUT_WIDTH, LABEL_MARGIN, LABEL_WIDTH } from './Uis.js';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *		text?: string,
 *		value?: string
 *		}} params
 * @return {[UIRow, UIText, UIText]}
 */
export function createRowText(params) {
	const { text = 'Label', value = '' } = params;

	const row = new UIRow();
	const input = new UIText(value);
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);

	row.add(label);
	row.add(input);

	return [row, input, label];
}

/**
 * @param {{
 *		text?: string,
 *		value?: string,
 *		update: ()=> void
 *		}} params
 * @return {[UIRow, UIInput, UIText]}
 */
export function createRowParamInput(params) {
	const { text = 'Label', value, update = () => {} } = params;

	const row = new UIRow();
	const input = new UIInput(value).setWidth(INPUT_WIDTH).setFontSize(FONT_SIZE).onChange(update);
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);

	row.add(label);
	row.add(input);

	return [row, input, label];
}
