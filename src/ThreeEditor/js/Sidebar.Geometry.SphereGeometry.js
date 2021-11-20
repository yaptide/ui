import * as THREE from 'three';
import { SetGeometryCommand } from './commands/Commands';
import { createRowParamNumber } from '../util/UiUtils';
import { UIRow } from './libs/ui.js';

function GeometryParametersPanel(editor, object) {
	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	const [radiusRow, radius] = createRowParamNumber({
		update,
		value: parameters.radius,
		min: 0,
		text: `${strings.getKey('sidebar/geometry/sphere_geometry/radius')} ${editor.unit.name}`
	});
	container.add(radiusRow);

	//

	function update() {
		editor.execute(
			new SetGeometryCommand(
				editor,
				object,
				new THREE.SphereGeometry(
					radius.getValue(),
					16,
					8,
					0 * THREE.MathUtils.DEG2RAD,
					360 * THREE.MathUtils.DEG2RAD,
					0 * THREE.MathUtils.DEG2RAD,
					180 * THREE.MathUtils.DEG2RAD
				)
			)
		);
	}

	return container;
}

export { GeometryParametersPanel };
