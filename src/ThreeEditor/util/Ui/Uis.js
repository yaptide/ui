export const LABEL_WIDTH = 'min(30%, 120px)';
export const LABEL_MARGIN = '10px 10px 10px 0';
export const INPUT_WIDTH = 'max(60%, 160px)';
export const FONT_SIZE = '12px';
export * from './Button';
export * from './Checkbox';
export * from './Color';
export * from './CustomTabbedPanel';
export * from './Number';
export * from './ReactUis';
export * from './Select';
export * from './Text';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {UIElement element}
 * @return {void}
 */

export function showUIElement(element) {
	element.setDisplay('');
}

/**
 * @param {UIElement element}
 * @return {void}
 */
export function hideUIElement(element) {
	element.setDisplay('none');
}
