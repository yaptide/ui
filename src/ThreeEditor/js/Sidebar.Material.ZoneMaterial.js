import { UIPanel, UIRow, UISelect, UIText } from './libs/ui.js';
import { SetZoneMaterialCommand } from './commands/Commands';
import { SidebarMaterialBooleanProperty } from './Sidebar.Material.BooleanProperty.js';
import { SidebarMaterialColorProperty } from './Sidebar.Material.ColorProperty.js';
import { SidebarMaterialConstantProperty } from './Sidebar.Material.ConstantProperty.js';
import { SidebarMaterialNumberProperty } from './Sidebar.Material.NumberProperty.js';


// Code copied (and adjusted) from SidebarMaterial.js
// https://github.com/mrdoob/three.js/blob/r132/editor/js/Sidebar.Material.js
export function SidebarZoneMaterial(editor) {

	const { signals, strings } = editor;
	const { materialOptions } = editor.materialsManager;

	let currentObject = null;

	let currentMaterialSlot = 0;

	const container = new UIPanel();
	container.setBorderTop('0');
	container.setDisplay('none');
	container.setPaddingTop('20px');

	// Current material slot

	const materialSlotRow = new UIRow();

	materialSlotRow.add(new UIText(strings.getKey('sidebar/material/slot')).setWidth('90px'));

	const materialSlotSelect = new UISelect().setWidth('170px').setFontSize('12px');
	materialSlotSelect.setOptions({ 0: '' }).setValue(0);
	materialSlotRow.add(materialSlotSelect);

	container.add(materialSlotRow);

	// SimulationMaterial type

	const materialClassRow = new UIRow();
	const materialClass = new UISelect().setWidth('150px').setFontSize('12px');

	materialClassRow.add(new UIText(strings.getKey('sidebar/material/type')).setWidth('90px'));
	materialClassRow.add(materialClass);

	container.add(materialClassRow);

	// color

	const materialColor = SidebarMaterialColorProperty(editor, 'color', strings.getKey('sidebar/material/color'));
	container.add(materialColor);

	// flatShading

	const materialFlatShading = new SidebarMaterialBooleanProperty(editor, 'flatShading', strings.getKey('sidebar/material/flatShading'));
	container.add(materialFlatShading);

	// blending

	const materialBlendingOptions = {
		0: 'No',
		1: 'Normal',
		2: 'Additive',
		3: 'Subtractive',
		4: 'Multiply',
	};

	const materialBlending = SidebarMaterialConstantProperty(editor, 'blending', strings.getKey('sidebar/material/blending'), materialBlendingOptions);
	container.add(materialBlending);

	// opacity

	const materialOpacity = SidebarMaterialNumberProperty(editor, 'opacity', strings.getKey('sidebar/material/opacity'), [0, 1]);
	container.add(materialOpacity);

	// transparent

	const materialTransparent = SidebarMaterialBooleanProperty(editor, 'transparent', strings.getKey('sidebar/material/transparent'));
	container.add(materialTransparent);

	//

	function setRowVisibility() {

		const material = currentObject?.material;

		if (Array.isArray(material)) {

			materialSlotRow.setDisplay('');

		} else {

			materialSlotRow.setDisplay('none');

		}

	}

	function refreshUI() {

		if (!currentObject) return;

		let { material } = currentObject;

		if (Array.isArray(material)) {

			const slotOptions = {};

			currentMaterialSlot = Math.max(0, Math.min(material.length, currentMaterialSlot));

			for (let i = 0; i < material.length; i++) {

				slotOptions[i] = String(i + 1) + ': ' + material[i].name;

			}

			materialSlotSelect.setOptions(slotOptions).setValue(currentMaterialSlot);

		}

		material = editor.getObjectMaterial(currentObject, currentMaterialSlot);

		materialClass.setOptions(materialOptions);

		materialClass.setValue(material.name);

		setRowVisibility();

	}

	function update() {

		const previousSelectedSlot = currentMaterialSlot;

		currentMaterialSlot = parseInt(materialSlotSelect.getValue(),10);

		if (currentMaterialSlot !== previousSelectedSlot) refreshUI();

		const material = editor.getObjectMaterial(currentObject, currentMaterialSlot);

		if (material) {

			const newMaterialName = materialClass.getValue();

			if (material.name !== newMaterialName) {

				editor.execute(new SetZoneMaterialCommand(editor, currentObject, newMaterialName), 'Zone aplied material: ' + newMaterialName);

				refreshUI();

			}
		}


	}
	
	materialSlotSelect.onChange(update)
	materialClass.onChange(update);

	// events

	signals.objectSelected.add((object) => {

		let hasMaterial = false;

		if (object && object.material) {

			hasMaterial = true;

			if (Array.isArray(object.material) && object.material.length === 0) {

				hasMaterial = false;

			}

		}

		if (hasMaterial) {

			currentObject = object;
			refreshUI();
			container.setDisplay('');

		} else {

			currentObject = null;
			container.setDisplay('none');

		}

	});

	signals.materialChanged.add((material) => {
		if (material?.isSimulationMaterial) {
			editor.materialsManager.materials[material.name] = material;
		}
		refreshUI()
	});

	return container;

}