import { UINumber, UIRow, UIText } from '../../ThreeEditor/js/libs/ui.js';
import { LABEL_MARGIN, LABEL_WIDTH, PRECISION_FRACTION, TRIPLE_LABEL_WIDTH } from './Uis.js';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {{
 *		value?: number,
 *		precision?: number
 *		update: (event)=> void,
 *		min?: number,
 *		max?: number,
 *		unit?: string,
 *		nudge?: number,
 *		step?: number,
 *		}} params
 * @return {UIScientificNumber}
 */
export function createNumberInput(params) {
   const {
      value = 0,
      precision = PRECISION_FRACTION,
      update,
      min,
      max,
      unit,
      nudge,
      step
   } = params;

   const input = new UIScientificNumber(value)
      .setPrecision(precision)
      .setWidth('50px')
      .onChange(update);
   if (unit !== undefined) input.setUnit(unit);

   if (nudge !== undefined) input.setNudge(nudge);

   if (step !== undefined) input.setStep(step);

   if (min !== undefined) input.min = min;

   if (max !== undefined) input.max = max;

   return input;
}

/**
 * @param {{
 *		text?: string,
 *		value?: number,
 *		precision?: number
 *		update: ()=> void,
 *		nudge?: number,
 *		step?: number,
 *		min?: number,
 *		max?: number
 *		unit?: string,
 *		}} params
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
 *		text?: string,
 *		value?: { x:number, y:number, z:number },
 *		precision?: number
 *		step?: number,
 *		nudge?: number,
 *		unit?: string,
 *		update: ()=> void,
 *		min?: number,
 *		max?: number
 *		}} params
 * @return {[UIRow, UINumber, UINumber, UINumber, UIText]}
 */
export function createRowParamNumberXYZ(params) {
   const { text = 'Label', value: { x, y, z } = {}, precision = 5 } = params;

   const row = new UIRow();
   row.dom.style.display = 'grid';
   row.dom.style.gridTemplateColumns = `${TRIPLE_LABEL_WIDTH} repeat(3, 1fr)`;
   const inputX = createNumberInput({ ...params, value: x, precision }).setWidth('100%');
   const inputY = createNumberInput({ ...params, value: y, precision }).setWidth('100%');
   const inputZ = createNumberInput({ ...params, value: z, precision }).setWidth('100%');
   const label = new UIText(text).setWidth(TRIPLE_LABEL_WIDTH).setMargin(LABEL_MARGIN);

   row.add(label);
   row.add(inputX, inputY, inputZ);
   return [row, inputX, inputY, inputZ, label];
}

export class UIScientificNumber extends UINumber {
   constructor(value = 0) {
      super(value);
      this.scientificNotation = true;
   }
   setScientificNotation(flag) {
      this.scientificNotation = flag;
      return this;
   }
   getScientificNotation() {
      return this.scientificNotation;
   }
   /**
    *
    * @param {number} value
    * @returns
    */
   setValue(value) {
      if (value === undefined) return this;
      if (!this.scientificNotation) {
         super.setValue(value);
         return this;
      }
      value = 0 + parseFloat(parseFloat(value).toFixed(this.precision));

      if (value < this.min) value = this.min;
      if (value > this.max) value = this.max;

      this.value = value;
      this.dom.value = value;
      this.dom.value.length > value.toFixed(this.precision).length &&
         parseFloat(value.toFixed(this.precision)) !== 0 &&
         (this.dom.value = value.toFixed(this.precision));
      this.dom.value.length > value.toExponential(this.precision).length &&
         (this.dom.value = value.toExponential(this.precision));
      this.dom.value.length > value.toExponential().length &&
         (this.dom.value = value.toExponential());
      if (this.unit !== '') this.dom.value += ' ' + this.unit;
      return this;
   }
}
