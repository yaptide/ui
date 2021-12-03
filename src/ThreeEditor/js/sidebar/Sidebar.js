import { UISpan, UITabbedPanel } from '../libs/ui.js';
import { SidebarOutput } from './Sidebar.Output';
import { SidebarProject } from './Sidebar.Project';
import { SidebarProperties } from './Sidebar.Properties';
import { SidebarScene } from './Sidebar.Scene';
import { SidebarSettings } from './Sidebar.Settings';

function Sidebar(editor) {
	const { signals } = editor;
	const container = new UISpan();
	const tabbed = new UITabbedPanel();
	container.setId('sidebar');
	const filters = new SidebarOutput(editor).setBorderTop('0').setPaddingTop('20px');
	const properties = new SidebarProperties(editor).setBorderTop('0');

	const scene = new UISpan().add(new SidebarScene(editor));
	const project = new SidebarProject(editor);
	const settings = new SidebarSettings(editor);
	const output = new UISpan().add(filters);
	let ignoreContextChangedSignal = false;

	tabbed.addTab('scene', 'SCENE', scene);
	tabbed.addTab('output', 'OUTPUT', output);
	tabbed.addTab('parameters', 'PARAMETERS', project);
	tabbed.addTab('settings', 'SETTINGS', settings);

	tabbed._select = tabbed.select;
	tabbed.select = function (id) {
		this._select(id);

		ignoreContextChangedSignal = true;
		editor.contextManager.currentContext = id;
		ignoreContextChangedSignal = false;
	};
	tabbed.select('scene');

	signals.contextChanged.add(id => {
		ignoreContextChangedSignal || tabbed._select(id);
	});

	container.add(tabbed);
	container.add(properties);

	return container;
}

export { Sidebar };
