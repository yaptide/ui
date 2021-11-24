import { UIButton, UIPanel } from '../libs/ui.js';
import { SetZoneMaterialCommand } from '../commands/Commands';
import { SidebarMaterialBooleanProperty } from './Sidebar.Material.BooleanProperty.js';
import { SidebarMaterialColorProperty } from './Sidebar.Material.ColorProperty.js';
import { SidebarMaterialConstantProperty } from './Sidebar.Material.ConstantProperty.js';
import { SidebarMaterialNumberProperty } from './Sidebar.Material.NumberProperty.js';
import { createMaterialSelect } from '../../util/UiUtils.js';

// Code copied (and adjusted) from SidebarMaterial.js
// https://github.com/mrdoob/three.js/blob/r132/editor/js/Sidebar.Material.js
export function SidebarZoneMaterial(editor) {
	const { signals, strings } = editor;

	let currentObject = null;

	const container = new UIPanel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	// SimulationMaterial type

	const [materialClassRow, materialClass, renderMaterialSelect] = createMaterialSelect(
		editor.materialsManager,
		update
	);

	container.add(materialClassRow);

	// color

	const materialColor = SidebarMaterialColorProperty(
		editor,
		'color',
		strings.getKey('sidebar/material/color')
	);
	container.add(materialColor);

	// flatShading

	const materialFlatShading = new SidebarMaterialBooleanProperty(
		editor,
		'flatShading',
		strings.getKey('sidebar/material/flatShading')
	);
	container.add(materialFlatShading);
	materialFlatShading.setClass('display-none');

	// blending

	const materialBlendingOptions = {
		0: 'No',
		1: 'Normal',
		2: 'Additive',
		3: 'Subtractive',
		4: 'Multiply'
	};

	const materialBlending = SidebarMaterialConstantProperty(
		editor,
		'blending',
		strings.getKey('sidebar/material/blending'),
		materialBlendingOptions
	);
	container.add(materialBlending);
	materialBlending.setClass('display-none');

	// opacity

	const materialOpacity = SidebarMaterialNumberProperty(
		editor,
		'opacity',
		strings.getKey('sidebar/material/opacity'),
		[0, 1]
	);
	container.add(materialOpacity);

	// transparent

	const materialTransparent = SidebarMaterialBooleanProperty(
		editor,
		'transparent',
		strings.getKey('sidebar/material/transparent')
	);
	container.add(materialTransparent);

	// export JSON

	const exportMaterials = new UIButton('Console Log Materials');
	exportMaterials.onClick(() => {
		console.log(editor.materialsManager.toJSON());
	});
	container.add(exportMaterials);

	//

	function refreshUI() {
		const { simulationMaterial } = currentObject;

		renderMaterialSelect(simulationMaterial.simulationData.name);
	}

	function update() {
		const { simulationMaterial } = currentObject;

		if (simulationMaterial) {
			const newMaterialName = materialClass.getValue();

			if (simulationMaterial.simulationData.name !== newMaterialName) {
				editor.execute(new SetZoneMaterialCommand(editor, currentObject, newMaterialName));

				refreshUI();
			}
		}
	}

	// events

	signals.objectSelected.add(object => {
		if (object?.simulationMaterial) {
			currentObject = object;
			refreshUI();
			container.setDisplay('');
		} else {
			currentObject = null;
			container.setDisplay('none');
		}
	});

	signals.materialChanged.add(material => {
		if (material?.isSimulationMaterial) {
			editor.materialsManager.materials[material.simulationData.name] = material;
		}
		refreshUI();
	});

	return container;
}
