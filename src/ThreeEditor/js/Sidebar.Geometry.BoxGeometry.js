import * as THREE from 'three';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { UINumber, UIRow, UIText } from './libs/ui.js';

function GeometryParametersPanel(editor, object) {

	const strings = editor.strings;

	const container = new UIRow();

	const geometry = object.geometry;
	const parameters = geometry.parameters;

	// width = height = depth

	const widthRow = new UIRow();
	const width = new UINumber(parameters.width).onChange(update);
	width.min = 0;

	widthRow.add(new UIText(strings.getKey('sidebar/geometry/box_geometry/width') + ' ' + editor.unit.name).setWidth('90px'));
	widthRow.add(width);

	container.add(widthRow);

	//

	function update() {

		editor.execute(new SetGeometryCommand(editor, object, new THREE.BoxGeometry(
			width.getValue(),
			width.getValue(),
			width.getValue(),
			1,
			1,
			1
		)));

	}

	return container;

}

export { GeometryParametersPanel };
