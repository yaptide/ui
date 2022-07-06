import { UIHorizontalRule, UIPanel, UIRow, UIText } from '../libs/ui.js';
import { createOption } from './Menubar.js';
import { saveString } from '../../../util/File';
import { MenubarSettings, MenubarSettingsEvent } from './Menubar.Settings.js';

function MenubarFile(editor) {
	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('File');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// New

	options.add(
		createOption('option', 'New', () => {
			window.confirm('Any unsaved data will be lost. Are you sure?') && editor.clear();
		}),
		new UIHorizontalRule()
	);

	// Open Editor from file
	const form = document.createElement('form');
	form.style.display = 'none';
	document.body.appendChild(form);

	const fileInput = document.createElement('input');
	fileInput.multiple = true;
	fileInput.type = 'file';
	fileInput.addEventListener('change', () => {
		editor.loader.loadFiles(fileInput.files);
		form.reset();
	});
	form.appendChild(fileInput);

	options.add(
		createOption('option', 'Open', () => {
			fileInput.click();
		}),
		new UIHorizontalRule()
	);

	// Save Editor to file

	options.add(
		createOption('option', 'Save', () => {

			let output = editor.toJSON();

			try {
				output = JSON.stringify(output, null, '\t');
				output = output.replace(/[\n\t]+([\d.e\-[\]]+)/g, '$1');
			} catch (e) {
				output = JSON.stringify(output);
			}

			const fileName = window.prompt('Name of the file', 'editor');

			if (fileName) saveString(output, `${fileName}.json`);
		}),
		new UIHorizontalRule()
	);


	// Settings
	const settingsModal = new UIPanel();
	settingsModal.setClass('sidebar');
	settingsModal.dom.style.left = '0';
	settingsModal.setDisplay('none');

	const settings = new MenubarSettings(editor);
	settings.dom.addEventListener(MenubarSettingsEvent.close, () => {
		settingsModal.setDisplay('none');
	})
	settingsModal.add(settings);
	editor.container.appendChild(settingsModal.dom);


	options.add(
		createOption('option', 'Settings', () => {
			settingsModal.setDisplay('');
		})

	);


	return container;
}

export { MenubarFile };
