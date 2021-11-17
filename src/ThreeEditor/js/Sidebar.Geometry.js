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

	const container = new UIPanel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	let currentGeometryType = null;

	// type

	const geometryTypeRow = new UIRow();
	const geometryType = new UIText();

	geometryTypeRow.add(new UIText(strings.getKey('sidebar/geometry/type')).setWidth('90px'));
	geometryTypeRow.add(geometryType);

	container.add(geometryTypeRow);


	// parameters

	const parameters = new UISpan();
	container.add(parameters);


	// Helpers

	const helpersRow = new UIRow().setMarginTop('16px').setPaddingLeft('90px');
	container.add(helpersRow);

	const vertexNormalsButton = new UIButton(strings.getKey('sidebar/geometry/show_vertex_normals'));
	vertexNormalsButton.onClick(() => {

		const object = editor.selected;

		if (editor.helpers[object.id] === undefined) {

			const helper = new VertexNormalsHelper(object);
			editor.addHelper(object, helper);

		} else {

			editor.removeHelper(object);

		}

		signals.sceneGraphChanged.dispatch();

	});
	helpersRow.add(vertexNormalsButton);

	async function build() {
		
		const object = editor.selected;

		if (isZone(object)) {
			parameters.clear();
			const zonePanel = new UISpan();
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
			const geometry = object.geometry;
			container.setDisplay('block');
			geometryType.setValue(geometry.type);
			//

			if (currentGeometryType !== geometry.type) {

				parameters.clear();

				if (geometry.type !== 'BufferGeometry') {



					try {

						const { GeometryParametersPanel } = await import(`./Sidebar.Geometry.${geometry.type}.js`);

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
		build();

	});

	signals.geometryChanged.add(build);

	return container;

}

export { SidebarGeometry };

