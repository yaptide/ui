import * as THREE from 'three';
import { createRowParamNumberXYZ, createRowParamNumber, createRowSelect } from '../../util/UiUtils.js';
import { SetValueCommand } from '../commands/Commands';
import { UIButton, UICheckbox, UIRow, UIText } from '../libs/ui.js';

const bodyTypeOptions = {
	box: 'box',
	cylinder: 'cylinder',
	sphere: 'sphere'
};

export function WorldZonePanel(editor, worldZone) {
	const strings = editor.strings;

	const container = new UIRow();

	// position

	const [objectPositionRow, objectPositionX, objectPositionY, objectPositionZ] =
		createRowParamNumberXYZ({
			text: `${strings.getKey('sidebar/object/position')} ${editor.unit.name}`,
			update
		});

	container.add(objectPositionRow);

	// geometry type
	const [geometryTypeRow, geometryType] = createRowSelect({
		text: 'Geometry Type',
		options: bodyTypeOptions,
		value: worldZone.geometryType,
		update: () => {
			if (worldZone.geometryType !== geometryType.getValue())
				editor.execute(
					new SetValueCommand(editor, worldZone, 'geometryType', geometryType.getValue())
				);
		}
	});

	container.add(geometryTypeRow);

	// width(box) / radius(sphere,cylinder)

	const [widthRow, width, widthText] = createRowParamNumber({ update });
	container.add(widthRow);

	// height(box,cylinder)

	const [heightRow, height, heightText] = createRowParamNumber({ update });
	container.add(heightRow);

	// depth(box)

	const [depthRow, depth, depthText] = createRowParamNumber({ update });
	container.add(depthRow);

	// auto calculate

	const calculateContainer = new UIRow();
	container.add(calculateContainer);

	// auto calculate checkbox

	const autoCalculateRow = new UIRow();
	const autoCalculate = new UICheckbox(worldZone.autoCalculate).onChange(() => {
		if (worldZone.autoCalculate !== autoCalculate.getValue())
			editor.execute(
				new SetValueCommand(
					editor,
					worldZone,
					'autoCalculate',
					autoCalculate.getValue(),
					true
				)
			);
	});

	autoCalculateRow.add(new UIText('Auto calculate').setWidth('90px'));
	autoCalculateRow.add(autoCalculate);

	calculateContainer.add(autoCalculateRow);

	// calculate button

	const calculateButton = new UIButton('CALCULATE').setWidth('100%');
	calculateButton.onClick(() => {
		worldZone.calculate();
	});
	calculateContainer.add(calculateButton);

	updateUI(worldZone);

	//

	function update() {
		const center = new THREE.Vector3(
			objectPositionX.getValue(),
			objectPositionY.getValue(),
			objectPositionZ.getValue()
		);

		if (center.distanceTo(worldZone.center) > 0)
			editor.execute(new SetValueCommand(editor, worldZone, 'center', center));

		const size = new THREE.Vector3(width.getValue(), height.getValue(), depth.getValue());

		if (size.distanceTo(worldZone.size) > 0)
			editor.execute(new SetValueCommand(editor, worldZone, 'size', size));
	}

	function updateUI() {
		const pos = worldZone.center;
		const size = worldZone.size;

		objectPositionX.setValue(pos.x);
		objectPositionZ.setValue(pos.z);
		objectPositionY.setValue(pos.y);

		[widthRow, heightRow, depthRow, calculateContainer].forEach(e => e.setDisplay('none'));

		if (worldZone.canCalculate()) calculateContainer.setDisplay('block');

		switch (worldZone.geometryType) {
			case 'box':
				[widthRow, heightRow, depthRow].forEach(e => e.setDisplay('block'));
				widthText.setValue(
					strings.getKey('sidebar/geometry/box_geometry/width') + ' ' + editor.unit.name
				);
				heightText.setValue(
					strings.getKey('sidebar/geometry/box_geometry/height') + ' ' + editor.unit.name
				);
				depthText.setValue(
					strings.getKey('sidebar/geometry/box_geometry/depth') + ' ' + editor.unit.name
				);
				break;

			case 'cylinder':
				[widthRow, heightRow].forEach(e => e.setDisplay('block'));
				widthText.setValue(
					strings.getKey('sidebar/geometry/sphere_geometry/radius') +
					' ' +
					editor.unit.name
				);
				heightText.setValue(
					strings.getKey('sidebar/geometry/cylinder_geometry/height') +
					' ' +
					editor.unit.name
				);
				break;

			case 'sphere':
				[widthRow].forEach(e => e.setDisplay('block'));
				widthText.setValue(
					strings.getKey('sidebar/geometry/sphere_geometry/radius') +
					' ' +
					editor.unit.name
				);
				break;

			default:
				console.error('Unsupported geometry type: ' + worldZone.geometryType);
		}

		width.setValue(size.x);
		height.setValue(size.y);
		depth.setValue(size.z);

		autoCalculate.setValue(worldZone.autoCalculate);
	}

	editor.signals.objectChanged.add(object => {
		if (object.isWorldZone) {
			worldZone = object;
			updateUI();
		}
	});

	return container;
}
