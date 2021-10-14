import * as THREE from 'three';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { UINumber, UIRow, UIText } from './libs/ui.js';

function GeometryParametersPanel(editor, object) {

	const strings = editor.strings;

	const container = new UIRow();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// radiusTop = radiusBottom => radius 

	const radiusRow = new UIRow();
	const radius = new UINumber(parameters.radiusTop).onChange(update);
	radius.min = 0;

	radiusRow.add(new UIText(strings.getKey('sidebar/geometry/sphere_geometry/radius') + ' ' + editor.unit.name).setWidth('90px'));
	radiusRow.add(radius);

	container.add(radiusRow);


	// height

	const heightRow = new UIRow();
	const height = new UINumber(parameters.height).onChange(update);

	heightRow.add(new UIText(strings.getKey('sidebar/geometry/cylinder_geometry/height') + ' ' + editor.unit.name).setWidth('90px'));
	heightRow.add(height);

	container.add(heightRow);


	//

	function update() {

		editor.execute(new SetGeometryCommand(editor, object, new THREE.CylinderGeometry(
			radius.getValue(),
			radius.getValue(),
			height.getValue(),
			16,
			1,
			false
		)));

	}

	return container;

}

export { GeometryParametersPanel };
