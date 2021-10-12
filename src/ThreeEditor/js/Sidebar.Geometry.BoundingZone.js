import * as THREE from 'three';
import { isBoundingZone } from '../util/BoundingZone';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { UIButton, UINumber, UIRow, UIText } from './libs/ui.js';

function BoundingZonePanel(editor, boundingZone) {

	const container = new UIRow();

	// position

	const objectPositionRow = new UIRow();
	const objectPositionX = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const objectPositionY = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const objectPositionZ = new UINumber().setPrecision(3).setWidth('50px').onChange(update);

	objectPositionRow.add(new UIText(editor.strings.getKey('sidebar/object/position') + ' ' + editor.unit.name).setWidth('90px'));
	objectPositionRow.add(objectPositionX, objectPositionY, objectPositionZ);

	container.add(objectPositionRow);


	// width = height = depth
	const widthRow = new UIRow();
	const width = new UINumber().onChange(update);
	width.min = 0;

	widthRow.add(new UIText(editor.strings.getKey('sidebar/geometry/box_geometry/width') + ' ' + editor.unit.name).setWidth('90px'));
	widthRow.add(width);

	container.add(widthRow);

	updateUI();


	//

	function update() {
		const center = new THREE.Vector3(objectPositionX.getValue(), objectPositionY.getValue(), objectPositionZ.getValue());
		const size = new THREE.Vector3().setScalar(width.getValue());

		boundingZone.setFromCenterAndSize(center, size);

	}

	function updateUI() {
		const pos = boundingZone.box.getCenter(new THREE.Vector3());
		const size = boundingZone.box.getSize(new THREE.Vector3());

		objectPositionX.setValue(pos.x);
		objectPositionZ.setValue(pos.z);
		objectPositionY.setValue(pos.y);

		width.setValue(size.x);
	}



	editor.signals.objectChanged.add(function (object) {

		if (isBoundingZone(object)) {
			updateUI();
		}

	});


	return container;

}

export { BoundingZonePanel };

