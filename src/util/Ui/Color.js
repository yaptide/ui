import { UIColor, UIRow, UIText } from '../../ThreeEditor/js/libs/ui.js';
import { LABEL_MARGIN, LABEL_WIDTH } from './Uis.js';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *		text?: string,
 *		value?: string,
 *		update?: ()=> void,
 *		}} params
 * @return {[UIRow, UIColor, UIText]}
 */
export function createRowColor(params) {
	const { text = 'Label', value = '#ffffff', update = () => {} } = params;
	const row = new UIRow();
	const color = new UIColor(value).onInput(update);
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);
	row.add(label, color);

	return [row, color, label];
}
