import { UIButton, UIPanel, UIRow } from '../libs/ui';
import { UIOutliner } from '../libs/ui.three';
import { escapeHTML } from './Sidebar.Scene';
import { AddFilterCommand } from '../commands/Commands';

export class SidebarFilters extends UIPanel {
	editor;
	signals;
	detectManager;
	outliner;
	objectSelected;

	createOptions(filters) {
		let options = filters.map(filter => {
			let option = document.createElement('div');
			option.className = 'option';
			option.value = filter.uuid;
			option.innerHTML = `<span class="type Points"></span> ${escapeHTML(filter.name)}`;
			return option;
		});
		return options;
	}

	onChange() {
		this.editor.selected = this.detectManager.getFilterByUuid(this.outliner.getValue());
	}

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

	changeSelection(object) {
		if (object) this.outliner.setValue(object.uuid);
		else this.outliner.setValue(null);
	}

	constructor(editor) {
		super();
		this.editor = editor;
		this.signals = editor.signals;
		this.detectManager = editor.detectManager;

		this.outliner = new UIOutliner(editor); //TODO: implement Outliner util function
		this.outliner.setId("filter-outliner")
		this.outliner.onChange(this.onChange.bind(this));
		this.add(this.outliner);
		this.updateOutlinerOptions();

		this.signals.detectFilterAdded.add(this.updateOutlinerOptions.bind(this));
		this.signals.detectFilterRemoved.add(this.updateOutlinerOptions.bind(this));
		this.signals.objectSelected.add(this.changeSelection.bind(this));

		this.createButton();
	}
	updateOutlinerOptions() {
		this.outliner.setOptions(this.createOptions(this.detectManager.filters));
	}
}
