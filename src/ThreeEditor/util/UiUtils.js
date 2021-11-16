import ReactDOM from 'react-dom';
import { UIRow, UINumber, UIText, UISelect, UIInput, UIElement, UIDiv } from "../js/libs/ui.js";
import { MaterialSelect } from '../components/MaterialSelect/MaterialSelect';

/**
 * @param {{
 *      value: number, 
 *      precision: number
 *      update: ()=> void,
 *      min : number,
 *      max : number,
 *      unit : string,
 *      nudge : number,
 *      step : number,
 *      }} params
 * @return {UINumber}
 */
function createNumberInput(params) {
    const {
        value = 0,
        precision = 3,
        update,
        min,
        max,
        unit,
        nudge,
        step
    } = params;

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
 *      text: string,
 *      value: { x:number, y:number, z:number }, 
 *      precision: number
 *      update: ()=> void,
 *      min : number,
 *      max : number
 *      }} params
 * @return {[UIRow, UINumber, UINumber, UINumber, UIText]}
 */
export function createRowParamNumberXYZ(params) {
    const {
        text = 'Label',
        value: { x, y, z } = {},
    } = params;

    const row = new UIRow();
    const inputX = createNumberInput({ ...params, value: x });
    const inputY = createNumberInput({ ...params, value: y });
    const inputZ = createNumberInput({ ...params, value: z });
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(inputX, inputY, inputZ);
    return [row, inputX, inputY, inputZ, label];
}

/**
 * @param {{
 *      text: string,
 *      value: number, 
 *      precision: number
 *      update: ()=> void,
 *      min : number,
 *      max : number
 *      }} params
 * @return {[UIRow, UINumber, UIText]}
 */
export function createRowParamNumber(params) {
    const {
        text = 'Label',
    } = params;

    const row = new UIRow();
    const input = createNumberInput({ ...params });
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(input);
    return [row, input, label];
}

/**
 * @param {{
 *      text: string,
 *      value: string
 *      }} params
 * @return {[UIRow, UIText, UIText]}
 */
export function createRowText(params) {
    const {
        text = 'Label',
        value
    } = params;

    const row = new UIRow();
    const input = new UIText(value);
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(input);
    return [row, input, label];
}

/**
 * @param {{
 *      text: string,
 *      value: string, 
 *      update: ()=> void
 *      }} params
 * @return {[UIRow, UIText, UIText]}
 */
export function createRowParamInput(params) {
    const {
        text = 'Label',
        value,
        update = () => { }
    } = params;

    const row = new UIRow();
    const input = new UIInput(value).setWidth('150px').setFontSize('12px').onChange(update);
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(input);
    return [row, input, label];
}

/**
 * @param {{
 *      text: string,
 *      value: string, 
 *      options: {[key:string]:string}
 *      update: ()=> void,
 *      }} params
 * @return {[UIRow, UISelect, UIText]}
 */
export function createRowSelect({
    text = 'Label',
    options,
    value,
    update
}) {

    const row = new UIRow();
    const select = new UISelect().setWidth('150px').setFontSize('12px').setOptions(options).setValue(value).onChange(update);
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(select);
    return [row, select, label];
}

/**
 * @param {string[]} options
 * @param {()=>void} update
 * @return {[UIRow,UISelect,(value:string)=>void]} render function
 */
export function createMaterialSelect(materialOptions, update) {
   
    const row = new UIRow();
    const container = new UIDiv().setWidth('150px').setDisplay('inline-block');
    const input = new UISelect().setWidth('150px');
    row.add(new UIText('Type').setWidth('90px'));
    row.add(container);

    const options = Object.values(materialOptions);

    return [row, input, (value) => {
        input.setOptions(materialOptions);
        input.setValue(value);
        ReactDOM.render(
            (<MaterialSelect options={options} value={value} onChange={(e, newValue) => {
                if (newValue) {
                    input.setValue(newValue);
                    update();
                }
            }} />),
            container.dom
        );
    }]
}