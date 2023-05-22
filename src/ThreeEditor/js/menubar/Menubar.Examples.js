import EXAMPLES from '../../examples/examples';
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

	/**
	 *
	 * @param {import('../EditorJson').EditorJson} example
	 */
	function loadExample(example) {
		editor.clear();
		editor.fromJSON(example.inputJson);
		editor.signals.exampleLoaded.dispatch(example);
	}

	// YAPTIDE examples
	options.add(
		...EXAMPLES.map(example =>
			createOption('option', example.input.inputJson.project?.title ?? 'Example', () => {
				window.confirm('Any unsaved data will be lost. Are you sure?') &&
					loadExample(example);
			})
		),
		new UIHorizontalRule()
	);

	return container;
}
