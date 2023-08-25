export const LABEL_WIDTH = 'min(33%, 100px)';
export const TRIPLE_LABEL_WIDTH = 'min(33%, 90px)';
export const LABEL_MARGIN = '0 10px 0 0';
export const INPUT_WIDTH = `max(${60}%, ${180}px)`;
export const TRIPLE_INPUT_WIDTH = `max(${60 / 3}%, ${180 / 3}px)`;
export const FONT_SIZE = '12px';
export const PRECISION = 16;
export const PRECISION_FRACTION = 8;
export * from './Button';
export * from './Checkbox';
export * from './Color';
export * from './CustomTabbedPanel';
export * from './Number';
export * from './PropertiesOutliner';
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

export function showUIElement(element, type = '') {
	element.setDisplay(type);
}

/**
 * @param {UIElement element}
 * @return {void}
 */
export function hideUIElement(element) {
	element.setDisplay('none');
}
