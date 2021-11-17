import * as THREE from 'three';
import { createRowParamNumber } from '../util/UiUtils';
import { SetGeometryCommand } from './commands/Commands';
import { UIRow } from './libs/ui.js';

function GeometryParametersPanel(editor, object) {

	const strings = editor.strings;

	const container = new UIRow();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// radiusTop = radiusBottom => radius 

	const [radiusRow, radius] = createRowParamNumber({
		update, value: parameters.radiusTop, min: 0,
		text: `${strings.getKey('sidebar/geometry/sphere_geometry/radius')} ${editor.unit.name}`
	});
	container.add(radiusRow);


	// height

	const [heightRow, height] = createRowParamNumber({
		update, value: parameters.height, min: 0,
		text: `${strings.getKey('sidebar/geometry/cylinder_geometry/height')} ${editor.unit.name}`
	});
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

