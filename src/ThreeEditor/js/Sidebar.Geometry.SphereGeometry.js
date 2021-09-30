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
	radius.min = 0;

	radiusRow.add( new UIText( strings.getKey( 'sidebar/geometry/sphere_geometry/radius' ) + ' ' + editor.unit.name).setWidth( '90px' ) );
	radiusRow.add( radius );

	container.add( radiusRow );

	

	//

	function update() {

		editor.execute( new SetGeometryCommand( editor, object, new THREE.SphereGeometry(
			radius.getValue(),
			16,
			8,
			0 * THREE.MathUtils.DEG2RAD,
			360 * THREE.MathUtils.DEG2RAD,
			0 * THREE.MathUtils.DEG2RAD,
			180 * THREE.MathUtils.DEG2RAD
		) ) );

	}

	return container;

}

export { GeometryParametersPanel };

