import { UIBreak, UIPanel } from '../libs/ui';
import { DetectAddPanel } from './Sidebar.AddPanel';
import { OutlinerManager } from './Sidebar.OutlinerManager';

export class SidebarScoring extends UIPanel {
	editor;
	signals;
	detectManager;
	detectAddPanel;
	outlinerManager;

	refreshOptions() {
		const sources = [
			this.editor.detectManager.detectContainer,
			this.editor.detectManager.filterContainer
		];
		this.outlinerManager.setOptionsFromSources(sources);
	}

	constructor(editor) {
		super();
		this.editor = editor;
		this.signals = editor.signals;
		this.detectManager = editor.detectManager;

		this.outlinerManager = new OutlinerManager(editor, this);
		this.outlinerManager.id = 'filter-outliner';

		this.add(new UIBreak());

		this.detectAddPanel = DetectAddPanel(editor, this);

		this.signals.editorCleared.add(this.refreshOptions.bind(this));
		this.signals.sceneGraphChanged.add(this.refreshOptions.bind(this));
		this.signals.objectChanged.add(this.refreshOptions.bind(this));
		this.signals.detectFilterAdded.add(this.refreshOptions.bind(this));
		this.signals.detectFilterRemoved.add(this.refreshOptions.bind(this));
	}
}
