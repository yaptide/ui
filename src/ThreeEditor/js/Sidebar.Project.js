import { UIPanel, UIRow, UIInput, UICheckbox, UIText, UISpan } from './libs/ui.js';

import { SidebarProjectRenderer } from './Sidebar.Project.Renderer.js';

function SidebarProject(editor) {

	const { signals, strings, config } = editor;

	let container = new UISpan();

	let settings = new UIPanel();
	settings.setBorderTop('0');
	settings.setPaddingTop('20px');
	container.add(settings);

	// Title

	let titleRow = new UIRow();
	let title = new UIInput(config.getKey('project/title')).setLeft('100px').setWidth('150px').onChange(() => {

		config.setKey('project/title', this.getValue());

	});

	titleRow.add(new UIText(strings.getKey('sidebar/project/title')).setWidth('90px'));
	titleRow.add(title);

	settings.add(titleRow);

	// Editable

	let editableRow = new UIRow();
	let editable = new UICheckbox(config.getKey('project/editable')).setLeft('100px').onChange(() => {

		config.setKey('project/editable', this.getValue());

	});

	editableRow.add(new UIText(strings.getKey('sidebar/project/editable')).setWidth('90px'));
	editableRow.add(editable);

	settings.add(editableRow);


	//

	container.add(new SidebarProjectRenderer(editor));


	// Signals

	signals.editorCleared.add(() => {

		title.setValue('');
		config.setKey('project/title', '');

	});

	return container;

}

export { SidebarProject };
