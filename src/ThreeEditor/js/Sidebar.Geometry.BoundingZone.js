import * as THREE from 'three';
import { UIButton, UICheckbox, UINumber, UIRow, UISelect, UIText } from './libs/ui.js';

const bodyTypeOptions = {
	'box': 'box',
	'cylinder': 'cylinder',
	'sphere': 'sphere'
};

function createParamRow(update) {
	const row = new UIRow();
	const param = new UINumber().onChange(update);
	const paramText = new UIText().setWidth('90px');

	row.add(paramText);
	row.add(param);

	return [row, param, paramText];
}

export function BoundingZonePanel(editor, boundingZone) {

	const strings = editor.strings;

	const container = new UIRow();

	// position

	const objectPositionRow = new UIRow();
	const objectPositionX = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const objectPositionY = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const objectPositionZ = new UINumber().setPrecision(3).setWidth('50px').onChange(update);

	objectPositionRow.add(new UIText(strings.getKey('sidebar/object/position') + ' ' + editor.unit.name).setWidth('90px'));
	objectPositionRow.add(objectPositionX, objectPositionY, objectPositionZ);

	container.add(objectPositionRow);


	// geometry type

	const geometryTypeRow = new UIRow();
	const geometryType = new UISelect().setWidth('150px').setFontSize('12px').setOptions(bodyTypeOptions).setValue(boundingZone.geometryType).onChange(update);

	geometryTypeRow.add(new UIText('Geometry Type').setWidth('90px'));
	geometryTypeRow.add(geometryType);

	container.add(geometryTypeRow);

	// width(box) / radius(sphere,cylinder)

	const [widthRow, width, widthText] = createParamRow(update);
	container.add(widthRow);

	// height(box,cylinder)

	const [heightRow, height, heightText] = createParamRow(update);
	container.add(heightRow);

	// depth(box)

	const [depthRow, depth, depthText] = createParamRow(update);
	container.add(depthRow);


	// auto calculate

	const calculateContainer = new UIRow();
	container.add(calculateContainer);


	const autoCalculateRow = new UIRow();
	const autoCalculate = new UICheckbox(boundingZone.autoCalculate).onChange(()=> {
		update();
		editor.signals.objectSelected.dispatch(boundingZone);
	});

	autoCalculateRow.add(new UIText("Auto calculate").setWidth('90px'));
	autoCalculateRow.add(autoCalculate);

	calculateContainer.add(autoCalculateRow);

	// calculate button

	const calculateButton = new UIButton("CALCULATE").setWidth('100%');
	calculateButton.onClick(() => {
		boundingZone.calculate();
	});
	calculateContainer.add(calculateButton);

	updateUI();


	//

	function update() {
		const center = new THREE.Vector3(objectPositionX.getValue(), objectPositionY.getValue(), objectPositionZ.getValue());
		const size = new THREE.Vector3(width.getValue(), height.getValue(), depth.getValue());

		boundingZone.setFromCenterAndSize(center, size);

		boundingZone.geometryType = geometryType.getValue(); // set before calling boundingZone.calculate() 

		boundingZone.autoCalculate = autoCalculate.getValue();
		if (boundingZone.autoCalculate) boundingZone.calculate();

		updateUI();
	}

	function updateUI() {
		const pos = boundingZone.box.getCenter(new THREE.Vector3());
		const size = boundingZone.box.getSize(new THREE.Vector3());

		objectPositionX.setValue(pos.x);
		objectPositionZ.setValue(pos.z);
		objectPositionY.setValue(pos.y);

		[widthRow, heightRow, depthRow, calculateContainer].forEach(e => e.setDisplay('none'));


		if (boundingZone.canCalculate()) calculateContainer.setDisplay('block');

		switch (boundingZone.geometryType) {
			case 'box':
				[widthRow, heightRow, depthRow].forEach(e => e.setDisplay('block'));
				widthText.setValue(strings.getKey('sidebar/geometry/box_geometry/width') + ' ' + editor.unit.name)
				heightText.setValue(strings.getKey('sidebar/geometry/box_geometry/height') + ' ' + editor.unit.name)
				depthText.setValue(strings.getKey('sidebar/geometry/box_geometry/depth') + ' ' + editor.unit.name)
				break;

			case 'cylinder':
				[widthRow, heightRow].forEach(e => e.setDisplay('block'));
				widthText.setValue(strings.getKey('sidebar/geometry/sphere_geometry/radius') + ' ' + editor.unit.name)
				heightText.setValue(strings.getKey('sidebar/geometry/cylinder_geometry/height') + ' ' + editor.unit.name)
				break;

			case 'sphere':
				[widthRow].forEach(e => e.setDisplay('block'));
				widthText.setValue(strings.getKey('sidebar/geometry/sphere_geometry/radius') + ' ' + editor.unit.name)
				break;

			default:
				console.error("Unsupported geometry type: " + boundingZone.geometryType)
		}

		width.setValue(size.x);
		height.setValue(size.y);
		depth.setValue(size.z);


	}



	editor.signals.objectChanged.add((object) => {

		if (object.isBoundingZone) {
			updateUI();
		}

	});


	return container;

}



