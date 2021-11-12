import React from 'react';
import ReactDOM from 'react-dom';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
import ZoneManagerPanel from '../components/ZoneManagerPanel/ZoneManagerPanel';
import { UIButton, UIPanel, UIRow, UISpan, UIText } from './libs/ui.js';
import { BoundingZonePanel } from './Sidebar.Geometry.BoundingZone';
import { isBeam } from '../util/Beam';
import { isZone } from '../util/CSG/CSGZone';
import { isBoundingZone } from '../util/BoundingZone';
import { isDetectSection } from '../util/Detect/DetectSection';
import { BeamPanel } from './Sidebar.Geometry.Beam';
import { DetectPanel } from './Sidebar.Geometry.Detect';

function SidebarGeometry(editor) {

	const { signals, strings } = editor;

	var container = new UIPanel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	var currentGeometryType = null;

	// type

	var geometryTypeRow = new UIRow();
	var geometryType = new UIText();

	geometryTypeRow.add(new UIText(strings.getKey('sidebar/geometry/type')).setWidth('90px'));
	geometryTypeRow.add(geometryType);

	container.add(geometryTypeRow);


	// parameters

	var parameters = new UISpan();
	container.add(parameters);


	// Helpers

	var helpersRow = new UIRow().setMarginTop('16px').setPaddingLeft('90px');
	container.add(helpersRow);

	var vertexNormalsButton = new UIButton(strings.getKey('sidebar/geometry/show_vertex_normals'));
	vertexNormalsButton.onClick(() => {

		var object = editor.selected;

		if (editor.helpers[object.id] === undefined) {

			var helper = new VertexNormalsHelper(object);
			editor.addHelper(object, helper);

		} else {

			editor.removeHelper(object);

		}

		signals.sceneGraphChanged.dispatch();

	});
	helpersRow.add(vertexNormalsButton);

	async function build() {
		
		var object = editor.selected;

		if (isZone(object)) {
			parameters.clear();
			let zonePanel = new UISpan();
			zonePanel.setId("zonePanel");
			parameters.add(zonePanel);
			geometryType.setValue(object.type);

			ReactDOM.render(
				(<ZoneManagerPanel editor={editor} zone={object} />),
				document.getElementById("zonePanel")
			);

			container.setDisplay('block');
			vertexNormalsButton.setDisplay('none');

		} else if (isBeam(object)) {

			parameters.clear();
			parameters.add(new BeamPanel(editor, object));
			geometryType.setValue(object.type);
			container.setDisplay('block');

			vertexNormalsButton.setDisplay('none');

		} else if (isBoundingZone(object)) {

			parameters.clear();
			parameters.add(new BoundingZonePanel(editor, object));
			geometryType.setValue(object.type);
			container.setDisplay('block');

			vertexNormalsButton.setDisplay('none');

		} else if (isDetectSection(object)) {

			parameters.clear();
			parameters.add(new DetectPanel(editor, object));
			geometryType.setValue(object.type);
			container.setDisplay('block');

			vertexNormalsButton.setDisplay('none');

		} else if (object && object.geometry) {

			vertexNormalsButton.setDisplay('block');
			var geometry = object.geometry;
			container.setDisplay('block');
			geometryType.setValue(geometry.type);
			//

			if (currentGeometryType !== geometry.type) {

				parameters.clear();

				if (geometry.type !== 'BufferGeometry') {



					try {

						var { GeometryParametersPanel } = await import(`./Sidebar.Geometry.${geometry.type}.js`);

						parameters.add(new GeometryParametersPanel(editor, object));

					} catch (e) {

						console.error(`Geometry: ${geometry.type} is not supported`);

					}


				}

				currentGeometryType = geometry.type;

			}

			if (geometry.boundingBox === null) geometry.computeBoundingBox();


		} else {

			container.setDisplay('none');

		}

	}

	signals.objectSelected.add(() => {

		currentGeometryType = null;
		vertexNormalsButton.setDisplay('block');
		build()
		// (isZone(editor.selected)
		// 	? buildZonesManager
		// 	: build
		// )();

	});

	signals.geometryChanged.add(build);

	return container;

}

export { SidebarGeometry };

