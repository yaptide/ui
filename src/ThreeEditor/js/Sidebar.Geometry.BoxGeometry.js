import * as THREE from 'three';
import { createRowParamNumber } from '../util/UiUtils';
import { SetGeometryCommand } from './commands/Commands';
import { UIRow } from './libs/ui.js';


function GeometryParametersPanel(editor, object) {

	const container = new UIRow();

	const geometry = object.geometry;
	const parameters = geometry.parameters;


	// width 

	const [widthRow, width] = createRowParamNumber({ update, value: parameters.width, text: `X side length (width) ${editor.unit.name}` });
	container.add(widthRow);

	// height

	const [heightRow, height] = createRowParamNumber({ update, value: parameters.height, text: `Y side length (height) ${editor.unit.name}` });
	container.add(heightRow);

	// depth

	const [depthRow, depth] = createRowParamNumber({ update, value: parameters.depth, text: `Z side length (depth) ${editor.unit.name}` });
	container.add(depthRow);


	//

	function update() {

		editor.execute(new SetGeometryCommand(editor, object, new THREE.BoxGeometry(
			width.getValue(),
			height.getValue(),
			depth.getValue(),
			1,
			1,
			1
		)));

	}

	return container;

}

export { GeometryParametersPanel };

