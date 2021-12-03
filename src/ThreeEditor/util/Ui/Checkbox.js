import { UICheckbox, UIRow, UIText } from '../../js/libs/ui.js';
import { LABEL_MARGIN, LABEL_WIDTH } from './Uis';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *      text?: string,
 *      value?: boolean,
 *      update?: ()=> void,
 *      }} params
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
