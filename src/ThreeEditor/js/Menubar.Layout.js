import { UIPanel } from './libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarLayout(editor) {
	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Layout');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// Single view
	options.add(
		createOption('option', 'Single View', () => {
			editor.signals.layoutChanged.dispatch('singleView');
		})
	);

	// Four view
	options.add(
		createOption('option', 'Four Views', () => {
			editor.signals.layoutChanged.dispatch('fourViews');
		})
	);

	return container;
}

export { MenubarLayout };
