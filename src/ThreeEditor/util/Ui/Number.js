import { UINumber, UIRow, UIText } from '../../js/libs/ui.js';
import { LABEL_MARGIN, LABEL_WIDTH, TRIPLE_INPUT_WIDTH, PRECISION } from './Uis';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *      value?: number,
 *      precision?: number
 *      update: ()=> void,
 *      min?: number,
 *      max?: number,
 *      unit?: string,
 *      nudge?: number,
 *      step?: number,
 *      }} params
 * @return {UINumber}
 */
function createNumberInput(params) {
	const { value = 0, precision = PRECISION, update, min, max, unit, nudge, step } = params;

	const input = new UINumber(value).setPrecision(precision).setWidth('50px').onChange(update);
	if (unit !== undefined) input.setUnit(unit);

	if (nudge !== undefined) input.setNudge(nudge);

	if (step !== undefined) input.setStep(step);

	if (min !== undefined) input.min = min;

	if (max !== undefined) input.max = max;

	return input;
}

/**
 * @param {{
 *      text?: string,
 *      value?: number,
 *      precision?: number
 *      update: ()=> void,
 *      step?: number,
 *      min?: number,
 *      max?: number
 * 		unit?: string,
 *      }} params
 * @return {[UIRow, UINumber, UIText]}
 */
export function createRowParamNumber(params) {
	const { text = 'Label' } = params;

	const row = new UIRow();
	const input = createNumberInput({ ...params }).setWidth('auto');
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);

	row.add(label);
	row.add(input);
	return [row, input, label];
}

/**
 * @param {{
 *      text?: string,
 *      value?: { x:number, y:number, z:number },
 *      precision?: number
 * 		step?: number,
 * 		nudge?: number,
 * 		unit?: string,
 *      update: ()=> void,
 *      min?: number,
 *      max?: number
 *      }} params
 * @return {[UIRow, UINumber, UINumber, UINumber, UIText]}
 */
export function createRowParamNumberXYZ(params) {
	const { text = 'Label', value: { x, y, z } = {} } = params;

	const row = new UIRow();
	const inputX = createNumberInput({ ...params, value: x }).setWidth(TRIPLE_INPUT_WIDTH);
	const inputY = createNumberInput({ ...params, value: y }).setWidth(TRIPLE_INPUT_WIDTH);
	const inputZ = createNumberInput({ ...params, value: z }).setWidth(TRIPLE_INPUT_WIDTH);
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);

	row.add(label);
	row.add(inputX, inputY, inputZ);
	return [row, inputX, inputY, inputZ, label];
}
