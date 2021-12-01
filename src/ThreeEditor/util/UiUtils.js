import ReactDOM from 'react-dom';
import { MaterialSelect } from '../components/Select/MaterialSelect';
import { ParticleSelect } from '../components/Select/ParticlesSelect';
import ZoneManagerPanel from '../components/ZoneManagerPanel/ZoneManagerPanel';
import {
	UIButton,
	UICheckbox,
	UIDiv,
	UIElement,
	UIInput,
	UINumber,
	UIRow,
	UISelect,
	UIText
} from '../js/libs/ui.js';
import { PARTICLE_TYPES } from './particles';

const LABEL_WIDTH = 'min(30%, 120px)';
const LABEL_MARGIN = '10px 10px 10px 0';
const INPUT_WIDTH = 'max(60%, 160px)';
const FONT_SIZE = '12px';

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
	const { value = 0, precision = 3, update, min, max, unit, nudge, step } = params;

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
 *      value?: { x:number, y:number, z:number },
 *      precision?: number
 *      update: ()=> void,
 *      min?: number,
 *      max?: number
 *      }} params
 * @return {[UIRow, UINumber, UINumber, UINumber, UIText]}
 */
export function createRowParamNumberXYZ(params) {
	const { text = 'Label', value: { x, y, z } = {} } = params;

	const row = new UIRow();
	const inputX = createNumberInput({ ...params, value: x });
	const inputY = createNumberInput({ ...params, value: y });
	const inputZ = createNumberInput({ ...params, value: z });
	const label = new UIText(text).setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN);

	row.add(label);
	row.add(inputX, inputY, inputZ);
	return [row, inputX, inputY, inputZ, label];
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
 *      value?: string
 *      }} params
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
 *      text?: string,
 *      value?: string,
 *      update: ()=> void
 *      }} params
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

/**
 * @param {{
 *      text?: string,
 *      options?: {[key:string]:string},
 *      value?: string,
 *      update: ()=> void,
 *      }} params
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

/**
 * @param {MaterialsManager} materialsManager
 * @param {()=>void} update
 * @return {[UIRow,UISelect,(value:string)=>void]} render function
 */
export function createMaterialSelect(materialsManager, update) {
	const { materialOptions, materials } = materialsManager;

	const row = new UIRow();
	const container = new UIDiv().setWidth(INPUT_WIDTH).setDisplay('inline-block');
	const input = new UISelect().setWidth(INPUT_WIDTH);
	row.add(new UIText('Material Type').setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN));
	row.add(container);

	return [
		row,
		input,
		value => {
			input.setOptions(materialOptions);
			input.setValue(value);
			ReactDOM.render(
				<MaterialSelect
					materials={materials}
					value={value}
					onChange={(_, newValue) => {
						if (newValue) {
							input.setValue(newValue);
							update();
						}
					}}
				/>,
				container.dom
			);
		}
	];
}

/**
 * @param {Editor} editor
 * @return {[UIRow,(zone: CSG.Zone) => void]} render function
 */
export function createZoneRulesPanel(editor) {
	const row = new UIRow();
	const container = new UIDiv().setWidth('100%').setDisplay('inline-block');
	row.add(container);

	return [
		row,
		zone => {
			ReactDOM.render(<ZoneManagerPanel editor={editor} zone={zone} />, container.dom);
		}
	];
}

/**
 * @param {()=>void} update
 * @return {[UIRow,UINumber,(value:string)=>void]} render function
 */
export function createParticleTypeSelect(update) {
	const row = new UIRow();
	const container = new UIDiv().setWidth(INPUT_WIDTH).setDisplay('inline-block');
	const input = new UINumber();
	row.add(new UIText('Particle type').setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN));
	row.add(container);

	return [
		row,
		input,
		value => {
			input.setValue(value);
			ReactDOM.render(
				<ParticleSelect
					particles={PARTICLE_TYPES}
					value={value}
					onChange={(_, newValue) => {
						if (newValue) {
							input.setValue(newValue);
							update();
						}
					}}
				/>,
				container.dom
			);
		}
	];
}

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

export class UICustomTabbedPanel extends UIDiv {
	/**
	 * @constructor
	 */
	constructor() {
		super();

		this.dom.className = 'TabbedPanel';

		this.tabs = [];
		this.panels = [];

		this.tabsDiv = new UIDiv();
		this.tabsDiv.setClass('Tabs');

		this.panelsDiv = new UIDiv();
		this.panelsDiv.setClass('Panels');

		this.add(this.tabsDiv);
		this.add(this.panelsDiv);

		this.selected = '';
	}

	/**
	 * @param {string id}
	 * @return {this}
	 */
	select(id) {
		let tab;
		let panel;
		const scope = this;

		// Deselect current selection
		if (this.selected && this.selected.length) {
			tab = this.tabs.find(function (item) {
				return item.dom.id === scope.selected;
			});
			panel = this.panels.find(function (item) {
				return item.dom.id === scope.selected;
			});

			if (tab) {
				tab.removeClass('selected');
			}

			if (panel) {
				panel.setDisplay('none');
			}
		}

		tab =
			this.tabs.find(function (item) {
				return item.dom.id === id;
			}) ?? this.tabs[0];
		panel =
			this.panels.find(function (item) {
				return item.dom.id === id;
			}) ?? this.panels[0];

		if (tab) {
			tab.addClass('selected');
		}

		if (panel) {
			panel.setDisplay('');
			this.selected = panel.dom.id;
		}

		return this;
	}

	/**
	 * @param {string id}
	 * @param {string label}
	 * @param {UIElement[] items}
	 * @return {void}
	 */
	addTab(id, label, items) {
		const tab = new UICustomTab(label, this);
		tab.setId(id);
		this.tabs.push(tab);
		this.tabsDiv.add(tab);

		const panel = new UIDiv();
		panel.setId(id);
		panel.add(...items);
		panel.setDisplay('none');
		panel.setPadding('10px');
		this.panels.push(panel);
		this.panelsDiv.add(panel);
	}

	/**
	 * @return {void}
	 */
	reset() {
		this.clear();
		this.dom.className = 'TabbedPanel';

		this.tabs = [];
		this.panels = [];

		this.tabsDiv = new UIDiv();
		this.tabsDiv.setClass('Tabs');

		this.panelsDiv = new UIDiv();
		this.panelsDiv.setClass('Panels');

		this.add(this.tabsDiv);
		this.add(this.panelsDiv);
	}
}
export class UICustomTab extends UIText {
	/**
	 * @param {string text}
	 * @param {UICustomTabbedPanel parent}
	 * @constructor
	 */
	constructor(text, parent) {
		super(text);

		this.dom.className = 'Tab';

		this.parent = parent;

		const scope = this;

		this.dom.addEventListener('click', function () {
			scope.parent.select(scope.dom.id);
		});
	}
}
