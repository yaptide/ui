import { UIPanel, UIRow } from '../libs/ui.js';

import { MenubarAdd } from './Menubar.Add.js';
import { MenubarEdit } from './Menubar.Edit.js';
import { MenubarExamples } from './Menubar.Examples.js';
import { MenubarFile } from './Menubar.File.js';
import { MenubarHelp } from './Menubar.Help.js';
import { MenubarStatus } from './Menubar.Status.js';
import { MenubarView } from './Menubar.View.js';

/**
 * @param {string} optionClass
 * @param {string} optionText
 * @param {() => void} optionClick
 * @return {UIRow}
 */
function createOption(optionClass, optionText, optionClick) {
	let option = new UIRow();
	option.setClass(optionClass);
	option.setTextContent(optionText);
	option.onClick(optionClick);
	return option;
}

function Menubar(editor) {
	const container = new UIPanel();
	container.setId('menubar');

	container.add(new MenubarFile(editor));
	container.add(new MenubarEdit(editor));
	container.add(new MenubarAdd(editor));
	container.add(new MenubarView(editor));
	container.add(new MenubarExamples(editor));
	container.add(new MenubarHelp(editor));

	container.add(new MenubarStatus(editor));

	return container;
}

export { Menubar, createOption };
