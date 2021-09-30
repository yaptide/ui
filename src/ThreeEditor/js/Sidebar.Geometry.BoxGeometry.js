import * as THREE from 'three';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { UINumber, UIRow, UIText } from './libs/ui.js';

function GeometryParametersPanel( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// width = height = depth

	var widthRow = new UIRow();
	var width = new UINumber( parameters.width ).onChange( update );
	width.min = 0;

	widthRow.add( new UIText( strings.getKey( 'sidebar/geometry/box_geometry/width' )+ ' ' + editor.unit.name ).setWidth( '90px' ) );
	widthRow.add( width );

	container.add( widthRow );

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.BoxGeometry(
			width.getValue(),
			width.getValue(),
			width.getValue(),
			1,
			1,
			1
		).translate ( 0, width.getValue() / 2, 0 ) ) );

	}

	return container;

}

export { GeometryParametersPanel };
