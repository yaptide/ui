import { UISpan, UITabbedPanel } from '../libs/ui.js';
import { SidebarScoring } from './Sidebar.Scoring';
import { SidebarProject } from './Sidebar.Project';
import { SidebarProperties } from './Sidebar.Properties';
import { SidebarScene } from './Sidebar.Scene';

function Sidebar(editor) {
	const { signals } = editor;
	const container = new UISpan();
	const tabbed = new UITabbedPanel();
	container.setId('sidebar');
	const properties = new SidebarProperties(editor).setBorderTop('0');

	const scene = new UISpan().add(new SidebarScene(editor));
	const scoring = new UISpan().add(
		new SidebarScoring(editor).setBorderTop('0').setPaddingTop('20px')
	);
	const project = new SidebarProject(editor);
	let ignoreContextChangedSignal = false;

	tabbed.addTab('scene', 'SCENE', scene);
	tabbed.addTab('scoring', 'SCORING', scoring);
	tabbed.addTab('project', 'PROJECT', project);

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

	editor.signals.exampleLoaded.add(() => {
		tabbed.select('project');
	})

	container.add(tabbed);
	container.add(properties);

	return container;
}

export { Sidebar };
