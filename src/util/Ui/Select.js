import { UIRow, UISelect, UIText } from '../../ThreeEditor/js/libs/ui.js';
import { FONT_SIZE, INPUT_WIDTH, LABEL_MARGIN, LABEL_WIDTH } from './Uis.js';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *		text?: string,
 *		options?: {[key:string]:string},
 *		value?: string,
 *		update: ()=> void,
 *		}} params
 * @return {[UIRow, UISelect, UIText]}
 */
export function createRowSelect({ text = 'Label', options = [], value, update }) {
	const row = new UIRow();
	const select = new UISelect()
		.setWidth(INPUT_WIDTH)
		.setFontSize(FONT_SIZE)
		.setOptions(options)
		.setValue(value)
		.onChange(update);
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);

	row.add(label);
	row.add(select);
	return [row, select, label];
}
