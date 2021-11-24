import { AddFilterCommand } from '../commands/Commands';
import { UIButton, UIPanel, UIRow } from '../libs/ui';
import { OutlinerManager } from './Sidebar.OutlinerManager';

export class SidebarFilters extends UIPanel {
	editor;
	signals;
	detectManager;
	outlinerManager;

	createButton() {
		const panel = new UIPanel();
		const row = new UIRow();
		const add_button = new UIButton("Add Detect Filter");

		add_button.onClick(() => {
			this.editor.execute(new AddFilterCommand(this.editor));
		});

		row.add(add_button);
		panel.add(row);
		this.add(panel);
	}

	refreshOptions() {
		const sources = [
			this.editor.detectManager.detectContainer,
			this.editor.detectManager.filterContainer
		];
		this.outlinerManager.setOptionsFromSources(sources);
	};

	constructor(editor) {
		super();
		this.editor = editor;
		this.signals = editor.signals;
		this.detectManager = editor.detectManager;

		this.outlinerManager = new OutlinerManager(editor, this);
		this.outlinerManager.id = 'filter-outliner';

		this.signals.editorCleared.add(this.refreshOptions.bind(this));

		this.signals.sceneGraphChanged.add(this.refreshOptions.bind(this));

		this.signals.objectChanged.add(this.refreshOptions.bind(this));

		this.signals.detectFilterAdded.add(this.refreshOptions.bind(this));

		this.signals.detectFilterRemoved.add(this.refreshOptions.bind(this));

		this.createButton();
	}
}
