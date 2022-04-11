import examples from '../../examples/examples';
import { UIHorizontalRule, UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';

/**
 * @typedef {import('../Editor').Editor} Editor
 * @param {Editor} editor
 * @constructor
 */
export function MenubarExamples(editor) {
	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Examples');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	function loadExample(example) {
		editor.clear();
		editor.fromJSON(example);
	}

	// YAPTIDE examples
	options.add(
		...examples.map(data =>
			createOption('option', data.project?.name ?? 'Example', () => {
				window.confirm('Any unsaved data will be lost. Are you sure?') && loadExample(data);
			})
		),
		new UIHorizontalRule()
	);

	return container;
}
