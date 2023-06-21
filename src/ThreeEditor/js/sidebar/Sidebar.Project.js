import { UIInput, UIPanel, UIRow, UISpan, UIText, UITextArea } from '../libs/ui.js';

function SidebarProject(editor) {
	const { signals, config } = editor;

	const container = new UISpan();

	const settings = new UIPanel();
	settings.setBorderTop('0');
	settings.setPaddingTop('20px');
	container.add(settings);

	// Title

	const titleRow = new UIRow();
	const title = new UIInput(config.getKey('project/title'))
		.setLeft('100px')
		.setWidth('160px')
		.onChange(() => {
			config.setKey('project/title', title.getValue());
			editor.signals.projectChanged.dispatch();
		});

	titleRow.add(new UIText('Title').setWidth('90px'));
	titleRow.add(title);

	settings.add(titleRow);

	// Description

	const descriptionRow = new UIRow();
	descriptionRow.add(new UIText('Description').setWidth('90px'));
	settings.add(descriptionRow);

	const description = new UITextArea()
		.setWidth('100%')
		.setHeight('400px')
		.onChange(() => {
			config.setKey('project/description', description.getValue());
			editor.signals.projectChanged.dispatch();
		});
	description.setValue(config.getKey('project/description'));
	description.dom.wrap = 'soft';
	description.dom.style.whiteSpace = 'break-spaces';

	settings.add(new UIRow().add(description));

	//

	// Signals

	signals.projectChanged.add(() => {
		title.setValue(config.getKey('project/title'));
		description.setValue(config.getKey('project/description'));
	});

	signals.editorCleared.add(() => {
		title.setValue('Untitled project');
		config.setKey('project/title', 'Untitled project');
		description.setValue('');
		config.setKey('project/description', '');
	});

	return container;
}

export { SidebarProject };
