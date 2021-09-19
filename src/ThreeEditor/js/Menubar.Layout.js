import { UIPanel } from './libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarLayout(editor) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass('menu');

	var title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Layout');
	container.add(title);

	var options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// Single view
	options.add(createOption('option', 'Single View', () => {
		editor.signals.layoutChanged.dispatch('singleView');

	}));

	// Four view
	options.add(createOption('option', 'Four Views', () => {
		editor.signals.layoutChanged.dispatch('fourViews');

	}));

	return container;

}

export { MenubarLayout };

