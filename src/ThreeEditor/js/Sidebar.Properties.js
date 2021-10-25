import { UITabbedPanel } from './libs/ui.js';

import { SidebarObject } from './Sidebar.Object.js';
import { SidebarGeometry } from './Sidebar.Geometry.js';
import { SidebarMaterial } from './Sidebar.Material.js';
import { SidebarZoneMaterial } from './Sidebar.Material.ZoneMaterial.js';

function SidebarProperties(editor) {

	const { strings, signals } = editor;

	let container = new UITabbedPanel();
	let material = new SidebarMaterial(editor);
	let zoneMaterial = new SidebarZoneMaterial(editor);
	container.setId('properties');

	container.addTab('object', strings.getKey('sidebar/properties/object'), new SidebarObject(editor));
	container.addTab('geometry', strings.getKey('sidebar/properties/geometry'), new SidebarGeometry(editor));
	container.addTab('material', strings.getKey('sidebar/properties/material'), material);
	container.select('object');

	//Select Geometry if zone is created
	signals.objectAdded.add((object) => object?.isCSGZone && container.select('geometry'));

	signals.objectSelected.add((object) => {
		container.panels[2].clear();
		container.panels[2].add(object?.isCSGZone ? zoneMaterial : material);
	});

	return container;

}

export { SidebarProperties };
