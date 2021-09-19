import * as THREE from 'three';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { UINumber, UIRow, UIText } from './libs/ui.js';

function GeometryParametersPanel( editor, object ) {

	var strings = editor.strings;

	var container = new UIRow();

	var geometry = object.geometry;
	var parameters = geometry.parameters;

	// radius

	var radiusRow = new UIRow();
	var radius = new UINumber( parameters.radius ).onChange( update );

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/radius' ) ).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );
	

	// height

	var heightRow = new UIRow();
	var height = new UINumber( parameters.height ).onChange( update );

	heightRow.add( new UIText( strings.getKey( 'sidebar/geometry/cylinder_geometry/height' ) ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );


	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.CylinderGeometry(
			radius.getValue(),
			radius.getValue(),
			height.getValue(),
			16,
			1,
			false
		).translate ( 0, height.getValue()/2, 0 ) ) );

	}

	return container;

}

export { GeometryParametersPanel };
