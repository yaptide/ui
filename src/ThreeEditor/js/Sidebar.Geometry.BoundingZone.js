import * as THREE from 'three';
import { createRowParamXYZ, createRowParam, createRowSelect } from '../util/UiUtils.js';
import { UIButton, UICheckbox, UINumber, UIRow, UISelect, UIText } from './libs/ui.js';

const bodyTypeOptions = {
	'box': 'box',
	'cylinder': 'cylinder',
	'sphere': 'sphere'
};



export function BoundingZonePanel(editor, boundingZone) {

	const strings = editor.strings;

	const container = new UIRow();

	// position

	const [objectPositionRow,
		objectPositionX,
		objectPositionY,
		objectPositionZ] = createRowParamXYZ({ text: `${strings.getKey('sidebar/object/position')} ${editor.unit.name}`, update });

	container.add(objectPositionRow);


	// geometry type
	const [geometryTypeRow, geometryType] = createRowSelect({ text: 'Geometry Type', options: bodyTypeOptions, value: boundingZone.geometryType, update })

	container.add(geometryTypeRow);

	// width(box) / radius(sphere,cylinder)

	const [widthRow, width, widthText] = createRowParam({ update });
	container.add(widthRow);

	// height(box,cylinder)

	const [heightRow, height, heightText] = createRowParam({ update });
	container.add(heightRow);

	// depth(box)

	const [depthRow, depth, depthText] = createRowParam({ update });
	container.add(depthRow);


	// auto calculate

	const calculateContainer = new UIRow();
	container.add(calculateContainer);

	// auto calculate checkbox

	const autoCalculateRow = new UIRow();
	const autoCalculate = new UICheckbox(boundingZone.autoCalculate).onChange(update);

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



