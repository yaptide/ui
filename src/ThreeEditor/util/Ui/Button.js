import { UIButton, UIRow } from '../../js/libs/ui.js';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *      text?: string,
 *      update?: ()=> void,
 *      }} params
 * @return {[UIRow, UIButton]}
 */
export function createFullwidthButton(params) {
	const { text = 'Button', update = () => {} } = params;
	const row = new UIRow();
	const button = new UIButton(text).onClick(update);
	button.setWidth('100%');
	row.add(button);
	return [row, button];
}
