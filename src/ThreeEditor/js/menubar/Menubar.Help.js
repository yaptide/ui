import { UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarHelp(editor) {
	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Help');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// Source code
	options.add(
		createOption('option', 'Source Code', () => {
			window.open('https://github.com/mrdoob/three.js/tree/master/editor', '_blank');
		})
	);

	// About
	options.add(
		createOption('option', 'About', () => {
			window.open('https://threejs.org', '_blank');
		})
	);

	// Manual
	options.add(
		createOption('option', 'Manual', () => {
			window.open('https://github.com/mrdoob/three.js/wiki/Editor-Manual', '_blank');
		})
	);

	return container;
}

export { MenubarHelp };
