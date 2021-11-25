import { UIBreak, UIPanel } from '../libs/ui.js';
import { OutlinerManager } from './Sidebar.OutlinerManager';
import { FigureAddPanel, ZoneAddPanel } from './Sidebar.AddPanel';

function SidebarScene(editor) {
	const { signals } = editor;

	const container = new UIPanel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	const outlinerManager = new OutlinerManager(editor, container);
	outlinerManager.id = 'outliner';

	const refreshOptions = function () {
		const sources = [
			editor.scene,
			editor.zoneManager.zoneContainer,
			editor.zoneManager.worldZone,
			editor.beam
		];
		outlinerManager.setOptionsFromSources(sources);
	};

	container.add(new UIBreak());

	const figureAddPanel = FigureAddPanel(editor, container);

	const sceneAddPanel = ZoneAddPanel(editor, container);

	//

	function refreshUI() {
		refreshOptions();
	}

	refreshUI();

	// events

	signals.editorCleared.add(refreshUI);

	signals.sceneGraphChanged.add(refreshUI);

	signals.objectChanged.add(refreshUI);

	return container;
}

export { SidebarScene };
