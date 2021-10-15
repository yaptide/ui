import * as THREE from 'three'

import { UIElement, UIPanel, UIText } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';
import deployInfo from '../../util/identify/deployInfo.json';


function MenubarStatus(editor) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass('menu right');

	const deploy = new UIElement(document.createElement('a')).setTextContent(`editor: ${deployInfo.date} ${deployInfo.commit}`);
	deploy.dom.href = 'https://github.com/yaptide/ui/commit/' + deployInfo.commit;
	deploy.dom.target = '_blank';
	deploy.dom.title = `${deployInfo.date} ${deployInfo.commit} ${deployInfo.branch}`;
	deploy.setClass('title');
	deploy.setOpacity(0.5);
	container.add(deploy);

	const version = new UIText('three.js: r' + THREE.REVISION);
	version.setClass('title');
	version.setOpacity(0.5);
	container.add(version);

	const autosave = new UIBoolean(editor.config.getKey('autosave'), strings.getKey('menubar/status/autosave'));
	autosave.text.setColor('#888');
	autosave.onChange(function () {

		const value = this.getValue();

		editor.config.setKey('autosave', value);

		if (value === true) {

			editor.signals.sceneGraphChanged.dispatch();

		}

	});
	container.add(autosave);

	editor.signals.savingStarted.add(function () {

		autosave.text.setTextDecoration('underline');

	});

	editor.signals.savingFinished.add(function () {

		autosave.text.setTextDecoration('none');

	});



	return container;

}

export { MenubarStatus };
