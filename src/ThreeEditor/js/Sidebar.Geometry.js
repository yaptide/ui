import * as THREE from 'three'

import { UIPanel, UIRow, UIText, UIInput, UIButton, UISpan } from './libs/ui.js';

import { SetGeometryValueCommand } from './commands/SetGeometryValueCommand.js';

import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

function SidebarGeometry( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UIPanel();
	container.setBorderTop( '0' );
	container.setDisplay( 'none' );
	container.setPaddingTop( '20px' );

	var currentGeometryType = null;

	// Actions

	/*
	var objectActions = new UISelect().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Center': 'Center',
		'Convert': 'Convert',
		'Flatten': 'Flatten'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		var action = this.getValue();

		var object = editor.selected;
		var geometry = object.geometry;

		if ( confirm( action + ' ' + object.name + '?' ) === false ) return;

		switch ( action ) {

			case 'Center':

				var offset = geometry.center();

				var newPosition = object.position.clone();
				newPosition.sub( offset );
				editor.execute( new SetPositionCommand( editor, object, newPosition ) );

				editor.signals.geometryChanged.dispatch( object );

				break;

			case 'Convert':

				if ( geometry && geometry.isGeometry ) {

					editor.execute( new SetGeometryCommand( editor, object, new THREE.BufferGeometry().fromGeometry( geometry ) ) );

				}

				break;

			case 'Flatten':

				var newGeometry = geometry.clone();
				newGeometry.uuid = geometry.uuid;
				newGeometry.applyMatrix( object.matrix );

				var cmds = [ new SetGeometryCommand( editor, object, newGeometry ),
					new SetPositionCommand( editor, object, new THREE.Vector3( 0, 0, 0 ) ),
					new SetRotationCommand( editor, object, new THREE.Euler( 0, 0, 0 ) ),
					new SetScaleCommand( editor, object, new THREE.Vector3( 1, 1, 1 ) ) ];

				editor.execute( new MultiCmdsCommand( editor, cmds ), 'Flatten Geometry' );

				break;

		}

		this.setValue( 'Actions' );

	} );
	container.addStatic( objectActions );
	*/

	// type

	var geometryTypeRow = new UIRow();
	var geometryType = new UIText();

	geometryTypeRow.add( new UIText( strings.getKey( 'sidebar/geometry/type' ) ).setWidth( '90px' ) );
	geometryTypeRow.add( geometryType );

	container.add( geometryTypeRow );


	// parameters

	var parameters = new UISpan();
	container.add( parameters );


	// Helpers

	var helpersRow = new UIRow().setMarginTop( '16px' ).setPaddingLeft( '90px' );
	container.add( helpersRow );

	var vertexNormalsButton = new UIButton( strings.getKey( 'sidebar/geometry/show_vertex_normals' ) );
	vertexNormalsButton.onClick( function () {

		var object = editor.selected;

		if ( editor.helpers[ object.id ] === undefined ) {

			var helper = new VertexNormalsHelper( object );
			editor.addHelper( object, helper );

		} else {

			editor.removeHelper( object );

		}

		signals.sceneGraphChanged.dispatch();

	} );
	helpersRow.add( vertexNormalsButton );

	async function build() {

		var object = editor.selected;

		if ( object && object.geometry ) {

			var geometry = object.geometry;

			container.setDisplay( 'block' );

			geometryType.setValue( geometry.type );

			

			//

			if ( currentGeometryType !== geometry.type ) {

				parameters.clear();

				if ( geometry.type === 'BufferGeometry' ) {

					// parameters.add( new SidebarGeometryModifiers( editor, object ) );

				} else {

					try{

						var { GeometryParametersPanel } = await import( `./Sidebar.Geometry.${ geometry.type }.js` );
						
						parameters.add( new GeometryParametersPanel( editor, object ) );

					} catch(e){

						console.error(`Geometry: ${ geometry.type } is not supported`);

					}						

				}

				currentGeometryType = geometry.type;

			}

			if ( geometry.boundingBox === null ) geometry.computeBoundingBox();


		} else {

			container.setDisplay( 'none' );

		}

	}

	signals.objectSelected.add( function () {

		currentGeometryType = null;

		build();

	} );

	signals.geometryChanged.add( build );

	return container;

}

export { SidebarGeometry };
