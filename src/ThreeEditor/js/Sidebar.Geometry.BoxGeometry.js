import * as THREE from 'three';
import { SetGeometryCommand } from './commands/Commands';
import { UINumber, UIRow, UIText } from './libs/ui.js';

function createParamRow(update, value, text) {
	const row = new UIRow();
	const param = new UINumber(value).onChange(update);
	const paramText = new UIText(text).setWidth('90px');
	param.min = 0;

	row.add(paramText);
	row.add(param);

	return [row, param, paramText];
}


function GeometryParametersPanel(editor, object) {

	const container = new UIRow();

	const geometry = object.geometry;
	const parameters = geometry.parameters;


	// width 

	const [widthRow, width] = createParamRow(update, parameters.width, `X side length (width) ${editor.unit.name}`);
	container.add(widthRow);

	// height

	const [heightRow, height] = createParamRow(update, parameters.height, `Y side length (height) ${editor.unit.name}`);
	container.add(heightRow);

	// depth

	const [depthRow, depth] = createParamRow(update, parameters.depth, `Z side length (depth) ${editor.unit.name}`);
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

