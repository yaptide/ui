import * as THREE from 'three';
import { isBoundingZone } from '../util/BoundingZone';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { UIButton, UINumber, UIRow, UIText } from './libs/ui.js';

function BoundingZonesPanel(editor, boundingZones) {

	const container = new UIRow();





	// position

	const objectPositionRow = new UIRow();
	const objectPositionX = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const objectPositionY = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const objectPositionZ = new UINumber().setPrecision(3).setWidth('50px').onChange(update);

	objectPositionRow.add(new UIText(editor.strings.getKey('sidebar/object/position') + ' ' + editor.unit.name).setWidth('90px'));
	objectPositionRow.add(objectPositionX, objectPositionY, objectPositionZ);

	objectPositionRow.setDisplay("none");
	container.add(objectPositionRow);


	// width = height = depth
	const widthRow = new UIRow();
	const width = new UINumber().onChange(update);
	width.min = 0;

	widthRow.add(new UIText(editor.strings.getKey('sidebar/geometry/box_geometry/width') + ' ' + editor.unit.name).setWidth('90px'));
	widthRow.add(width);

	widthRow.setDisplay("none");
	container.add(widthRow);

	const calculateButton = new UIButton("CALCULATE BOUNDING ZONES");
	calculateButton.onClick(function () {
		boundingZones.calculate();
			});
	container.add(calculateButton);


	//

	function update() {


	}

	function updateUI() {
		const pos = boundingZones.vacuum.box.getCenter(new THREE.Vector3());
		const size = boundingZones.vacuum.box.getSize(new THREE.Vector3());

		objectPositionX.setValue(pos.x);
		objectPositionZ.setValue(pos.z);
		objectPositionY.setValue(pos.y);

		width.setValue(size.x);

		objectPositionRow.setDisplay("block");
		widthRow.setDisplay("block");
	}



	editor.signals.objectChanged.add(function (object) {

		if (isBoundingZone(object)) {
			updateUI();
		}

	});


	return container;

}

export { BoundingZonesPanel };

