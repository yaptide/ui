import ReactDOM from 'react-dom';

import { MaterialSelect } from '../../ThreeEditor/components/Select/MaterialSelect';
import { ParticleSelect } from '../../ThreeEditor/components/Select/ParticleSelect';
import ZoneManagerPanel from '../../ThreeEditor/components/ZoneManagerPanel/ZoneManagerPanel';
import { UIDiv, UINumber, UIRow, UISelect, UIText } from '../../ThreeEditor/js/libs/ui.js';
import { COMMON_PARTICLE_TYPES } from '../../types/Particle';
import { INPUT_WIDTH, LABEL_MARGIN, LABEL_WIDTH } from './Uis';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

/**
 * @param {()=>void} update
 * @return {[UIRow,UINumber,(value:number)=>void]} render function
 */
export function createParticleTypeSelect(update) {
	const row = new UIRow();
	const container = new UIDiv().setWidth(INPUT_WIDTH).setDisplay('inline-block');
	const input = new UINumber();
	row.add(new UIText('Particle type').setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN));
	row.add(container);
	const onChange = (_, newValue) => {
		if (newValue) {
			input.setValue(newValue);
			update();
		}
	};

	return [
		row,
		input,
		value => {
			input.setValue(value);
			ReactDOM.render(
				<ParticleSelect
					particles={COMMON_PARTICLE_TYPES}
					value={value}
					onChange={onChange}
				/>,
				container.dom
			);
		}
	];
}

/**
 * @param {MaterialManager} materialManager
 * @param {()=>void} update
 * @return {[UIRow,UISelect,(value:number)=>void]} render function
 */
export function createMaterialSelect(materialManager, update) {
	const { materialOptions, materials } = materialManager;

	const row = new UIRow();
	const container = new UIDiv().setWidth(INPUT_WIDTH).setDisplay('inline-block');
	const input = new UISelect().setWidth(INPUT_WIDTH);
	row.add(new UIText('Material Type').setWidth(LABEL_WIDTH).setMargin(LABEL_MARGIN));
	row.add(container);
	const onChange = (_, newValue) => {
		if (typeof newValue === 'number') {
			input.setValue(newValue);
			update();
		}
	};

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
					onChange={onChange}
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
			ReactDOM.render(
				<ZoneManagerPanel
					editor={editor}
					zone={zone}
				/>,
				container.dom
			);
		}
	];
}
