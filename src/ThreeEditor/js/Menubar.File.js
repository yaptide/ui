import { UIHorizontalRule, UIPanel, UIRow } from './libs/ui.js';

function MenubarFile(editor) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent(strings.getKey('menubar/file'));
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// New

	let option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/new'));
	option.onClick(() => {

		if (window.confirm('Any unsaved data will be lost. Are you sure?')) {

			editor.clear();

		}

	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());

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

	option = new UIRow();
	option.setClass('option');
	option.setTextContent('Open');
	option.onClick(() => {

		fileInput.click();

	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());


	// Save Editor to file

	option = new UIRow();
	option.setClass('option');
	option.setTextContent('Save');
	option.onClick(() => {

		editor.updateUserData();

		let output = editor.toJSON();

		try {

			output = JSON.stringify(output, null, '\t');
			output = output.replace(/[\n\t]+([\d.e\-[\]]+)/g, '$1');

		} catch (e) {

			output = JSON.stringify(output);

		}

		const fileName = window.prompt('Name of the file', 'editor');

		if (fileName)
			saveString(output, `${fileName}.json`);

	});
	options.add(option);



	//

	const link = document.createElement('a');
	function save(blob, filename) {

		if (link.href) {

			URL.revokeObjectURL(link.href);

		}

		link.href = URL.createObjectURL(blob);
		link.download = filename || 'data.json';
		link.dispatchEvent(new MouseEvent('click'));

	}


	function saveString(text, filename) {

		save(new Blob([text], { type: 'text/plain' }), filename);

	}


	return container;

}

export { MenubarFile };

