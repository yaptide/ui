import { UITabbedPanel, UISpan } from '../libs/ui.js';

import { SidebarScene } from './Sidebar.Scene';
import { SidebarProperties } from './Sidebar.Properties';
import { SidebarProject } from './Sidebar.Project';
import { SidebarSettings } from './Sidebar.Settings';
import { SidebarOutput } from './Sidebar.Output';

function Sidebar(editor) {
	const { strings, signals } = editor;

	const container = new UITabbedPanel();
	container.setId('sidebar');
	const filters = new SidebarOutput(editor).setBorderTop('0').setPaddingTop('20px');

	const scene = new UISpan().add(new SidebarScene(editor), new SidebarProperties(editor));
	const project = new SidebarProject(editor);
	const settings = new SidebarSettings(editor);
	const output = new UISpan().add(filters, new SidebarProperties(editor));
	let ignoreContextChangedSignal = false;

	container.addTab('scene', strings.getKey('sidebar/scene'), scene);
	container.addTab('output', 'OUTPUT', output);
	container.addTab('parameters', 'PARAMETERS', project);
	container.addTab('settings', strings.getKey('sidebar/settings'), settings);

	container._select = container.select;
	container.select = function (id) {
		this._select(id);

		ignoreContextChangedSignal = true;
		editor.contextManager.currentContext = id;
		ignoreContextChangedSignal = false;
	};
	container.select('scene');

	signals.contextChanged.add(id => {
		ignoreContextChangedSignal || container._select(id);
	});

	return container;
}

export { Sidebar };
