import { UITabbedPanel, UISpan } from './libs/ui.js';

import { SidebarScene } from './Sidebar.Scene';
import { SidebarProperties } from './Sidebar.Properties';
import { SidebarProject } from './Sidebar.Project';
import { SidebarSettings } from './Sidebar.Settings';
import { SidebarFilters } from './Sidebar.Filters';

function Sidebar(editor) {
	const { strings, signals } = editor;

	const container = new UITabbedPanel();
	container.setId('sidebar');

	const scene = new UISpan().add(new SidebarScene(editor), new SidebarProperties(editor));
	const project = new SidebarProject(editor);
	const settings = new SidebarSettings(editor);
	const filters = new SidebarFilters(editor);

	container.addTab('scene', strings.getKey('sidebar/scene'), scene);
	container.addTab('filters', 'FILTERS', filters);
	container.addTab('project', strings.getKey('sidebar/project'), project);
	container.addTab('settings', strings.getKey('sidebar/settings'), settings);
	container.select('scene');

	//Select Scene if zone is created
	signals.objectAdded.add(object => object?.isZone && container.select('scene'));

	return container;
}

export { Sidebar };
