// Color
// Opacity
// Transparent
// Wireframe

import { isBasicMesh } from '../../util/BasicMeshes';
import { Beam, isBeam } from '../../util/Beam';
import { isZone } from '../../util/CSG/CSGZone';
import { isDetectGeometry } from '../../util/Detect/DetectGeometry';
import SimulationMaterial from '../../util/Materials/SimulationMaterial';
import {
	SimulationMesh,
	SimulationObject3D,
	SimulationPoints
} from '../../util/SimulationBase/SimulationMesh';
import {
	createFullwidthButton,
	createMaterialSelect,
	createRowText,
	hideUIElement,
	showUIElement
} from '../../util/UiUtils';
import { isWorldZone } from '../../util/WorldZone';
import { SetZoneMaterialCommand } from '../commands/SetZoneMaterialCommand';
import { Editor } from '../Editor';
import { UIButton, UIRow, UISelect, UIText } from '../libs/ui';
import { SidebarMaterialBooleanProperty } from '../sidebar/Sidebar.Material.BooleanProperty';
import { SidebarMaterialColorProperty } from '../sidebar/Sidebar.Material.ColorProperty';
import { SidebarMaterialConstantProperty } from '../sidebar/Sidebar.Material.ConstantProperty';
import { SidebarMaterialNumberProperty } from '../sidebar/Sidebar.Material.NumberProperty';
import { ObjectAbstract } from './Object.Abstract';

const MATERIAL_BLENDING_OPTIONS = {
	0: 'No',
	1: 'Normal',
	2: 'Additive',
	3: 'Subtractive',
	4: 'Multiply'
} as const;

export class ObjectMaterial extends ObjectAbstract {
	object?: SimulationMesh | SimulationPoints | Beam;
	material?: THREE.LineBasicMaterial | THREE.Material | SimulationMaterial;

	typeRow: UIRow;
	type: UIText;

	typeSelectRow: UIRow;
	typeSelect: UISelect;
	renderTypeSelect: (value: string) => void;

	//TODO: Rewrite this in UIUtils file.
	colorRow: UIRow;
	flatShadingRow: UIRow;
	blendingRow: UIRow;
	opacityRow: UIRow;
	transparentRow: UIRow;

	exportMaterialsRow: UIRow;
	exportMaterials: UIButton;

	constructor(editor: Editor) {
		super(editor, 'Visuals');

		[this.typeRow, this.type] = createRowText({ text: 'Material Type' });
		[this.typeSelectRow, this.typeSelect, this.renderTypeSelect] = createMaterialSelect(
			editor.materialsManager,
			this.update.bind(this)
		);

		// color
		this.colorRow = SidebarMaterialColorProperty(editor, 'color', 'Color');

		// flatShading
		this.flatShadingRow = SidebarMaterialBooleanProperty(editor, 'flatShading', 'Flat Shading');
		// this.materialFlatShading.setClass('display-none');

		// blending

		this.blendingRow = SidebarMaterialConstantProperty(
			editor,
			'blending',
			'Blending',
			MATERIAL_BLENDING_OPTIONS
		);
		// materialBlending.setClass('display-none');

		// opacity
		this.opacityRow = SidebarMaterialNumberProperty(editor, 'opacity', 'Opacity', [0, 1]);

		// transparent

		this.transparentRow = SidebarMaterialBooleanProperty(editor, 'transparent', 'Transparent');

		// export JSON
		[this.exportMaterialsRow, this.exportMaterials] = createFullwidthButton({
			text: 'Console Log Materials',
			update: this.materialConsole.bind(this)
		});

		this.panel.add(
			this.typeRow,
			this.typeSelectRow,
			this.colorRow,
			/*
			 * Disable flatShading and blending for now.
			 * this.flatShadingRow,
			 * this.blendingRow,
			 */
			this.opacityRow,
			this.transparentRow,
			this.exportMaterialsRow
		);
	}

	setObject(object: SimulationMesh | Beam | SimulationPoints): void {
		this.object = object;
		hideUIElement(this.typeRow);
		hideUIElement(this.typeSelectRow);
		hideUIElement(this.opacityRow);
		hideUIElement(this.transparentRow);
		hideUIElement(this.exportMaterialsRow);
		if (isWorldZone(object) || isZone(object)) {
			showUIElement(this.typeSelectRow);
			if (isZone(object)) {
				showUIElement(this.opacityRow);
				showUIElement(this.transparentRow);
				showUIElement(this.exportMaterialsRow);
			}
			this.typeSelect.setValue(object.simulationMaterial.name);
		} else {
			showUIElement(this.typeRow);
			this.material = object.material;
			this.type.setValue(this.material.type);
		}
		this.render();
	}

	update(): void {
		const { editor, object } = this;
		if (!object) return;
		if (isWorldZone(object) || isZone(object))
			editor.execute(new SetZoneMaterialCommand(editor, object, this.typeSelect.getValue()));
	}

	render(): void {
		if (!isWorldZone(this.object) && !isZone(this.object)) return;
		this.renderTypeSelect(this.object.simulationMaterial.name);
	}
	materialConsole(): void {
		console.log(this.editor.materialsManager.toJSON());
	}
}
