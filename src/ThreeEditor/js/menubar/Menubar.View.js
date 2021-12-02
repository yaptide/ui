import { UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarView(editor) {
	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('View');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// Fullscreen
	options.add(
		createOption('option', 'Fullscreen', () => {
			document.fullscreenElement === null
				? document.documentElement.requestFullscreen()
				: document.exitFullscreen();

			document.webkitFullscreenElement === null // Safari
				? document.documentElement.webkitRequestFullscreen()
				: document.webkitExitFullscreen();
		})
	);

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

export { MenubarView };
