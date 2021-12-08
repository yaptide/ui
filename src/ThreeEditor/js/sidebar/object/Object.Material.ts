import { Beam } from '../../../util/Beam';
import { isZone } from '../../../util/CSG/CSGZone';
import { SimulationMesh, SimulationPoints } from '../../../util/SimulationBase/SimulationMesh';
import {
	createFullwidthButton,
	createMaterialSelect,
	createRowCheckbox,
	createRowColor,
	createRowConditionalNumber,
	createRowParamNumber,
	createRowText,
	hideUIElement,
	showUIElement
} from '../../../util/Ui/Uis';
import { isWorldZone } from '../../../util/WorldZone';
import {
	SetMaterialColorCommand,
	SetMaterialValueCommand,
	SetZoneMaterialCommand
} from '../../commands/Commands';
import { Editor } from '../../Editor';
import { UIButton, UICheckbox, UIColor, UINumber, UIRow, UISelect, UIText } from '../../libs/ui';
import { SidebarMaterialBooleanProperty } from '../Sidebar.Material.BooleanProperty';
import { SidebarMaterialConstantProperty } from '../Sidebar.Material.ConstantProperty';
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

	typeRow: UIRow;
	type: UIText;

	typeSelectRow: UIRow;
	typeSelect: UISelect;
	renderTypeSelect: (value: string) => void;

	colorRow: UIRow;
	color: UIColor;

	flatShadingRow: UIRow;
	blendingRow: UIRow;

	opacityRow: UIRow;
	opacity: UINumber;
	transparent: UICheckbox;

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
		[this.colorRow, this.color] = createRowColor({
			text: 'Color',
			update: this.update.bind(this)
		});

		// flatShading
		this.flatShadingRow = SidebarMaterialBooleanProperty(editor, 'flatShading', 'Flat Shading');

		// blending
		this.blendingRow = SidebarMaterialConstantProperty(
			editor,
			'blending',
			'Blending',
			MATERIAL_BLENDING_OPTIONS
		);

		// opacity
		[this.opacityRow, this.transparent, this.opacity] = createRowConditionalNumber({
			text: 'Opacity',
			min: 0,
			max: 1,
			step: 0.05,
			update: this.update.bind(this)
		});

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
			this.exportMaterialsRow
		);
	}

	setObject(object: SimulationMesh | Beam | SimulationPoints): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		const { color, opacity, transparent } = object.material;
		hideUIElement(this.typeRow);
		hideUIElement(this.typeSelectRow);
		hideUIElement(this.opacityRow);
		hideUIElement(this.exportMaterialsRow);
		this.color.setHexValue(color.getHexString());
		if (isWorldZone(object) || isZone(object)) {
			showUIElement(this.typeSelectRow);
			if (isZone(object)) {
				showUIElement(this.opacityRow);
				if (transparent) showUIElement(this.opacity);
				else hideUIElement(this.opacity);
				showUIElement(this.exportMaterialsRow);
				this.opacity.setValue(object.material.opacity);
				this.transparent.setValue(object.material.transparent);
			}
			this.typeSelect.setValue(object.simulationMaterial.name);
		} else {
			showUIElement(this.typeRow);
			this.type.setValue(this.object.material.type);
		}
		this.render();
	}

	update(): void {
		const { editor, object } = this;
		if (!object) return;
		if (
			(isWorldZone(object) || isZone(object)) &&
			object.simulationMaterial.name !== this.typeSelect.getValue()
		)
			editor.execute(new SetZoneMaterialCommand(editor, object, this.typeSelect.getValue()));
		if (object.material.color.getHex() !== this.color.getHexValue())
			editor.execute(
				new SetMaterialColorCommand(editor, object, 'color', this.color.getHexValue())
			);
		if (isZone(object) && object.material.opacity !== this.opacity.getValue())
			editor.execute(
				new SetMaterialValueCommand(editor, object, 'opacity', this.opacity.getValue())
			);
		if (isZone(object) && object.material.transparent !== this.transparent.getValue())
			editor.execute(
				new SetMaterialValueCommand(
					editor,
					object,
					'transparent',
					this.transparent.getValue()
				)
			);
	}

	render(): void {
		if (!isWorldZone(this.object) && !isZone(this.object)) return;
		this.renderTypeSelect(this.object.simulationMaterial.name);
	}
	materialConsole(): void {
		console.log(this.editor.materialsManager.toJSON());
	}
}
