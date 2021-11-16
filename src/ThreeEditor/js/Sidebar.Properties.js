import { UITabbedPanel, UIPanel } from './libs/ui.js';

import { SidebarObject } from './Sidebar.Object.js';
import { SidebarGeometry } from './Sidebar.Geometry.js';
import { SidebarMaterial } from './Sidebar.Material.js';
import { SidebarZoneMaterial } from './Sidebar.Material.ZoneMaterial.js';

function SidebarProperties(editor) {

	const { strings, signals } = editor;

	const container = new UITabbedPanel();
	const material = new SidebarMaterial(editor);
	const zoneMaterial = new SidebarZoneMaterial(editor);

	function getPanel(object) {
		if (object) 
			if (object.isCSGZone)
				return zoneMaterial;
			else if (!object.isDetectSection)
				return material;
		return new UIPanel();
	}

	container.setId('properties');

	container.addTab('object', strings.getKey('sidebar/properties/object'), new SidebarObject(editor));
	container.addTab('geometry', strings.getKey('sidebar/properties/geometry'), new SidebarGeometry(editor));
	container.addTab('material', strings.getKey('sidebar/properties/material'), material);
	container.select('object');

	//Select Geometry if zone is created
	signals.objectAdded.add((object) => object?.isCSGZone && container.select('geometry'));

	signals.objectSelected.add((object) => {

		container.panels[2].clear();
		container.panels[2].add(getPanel(object));
	});

	return container;

}

export { SidebarProperties };
