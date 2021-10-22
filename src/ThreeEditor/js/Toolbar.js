import { UIPanel, UIButton, UICheckbox } from './libs/ui.js';

function Toolbar(editor) {

	const { signals, strings } = editor;

	var container = new UIPanel();
	container.setId('toolbar');

	// YAPTIDE select mode
	var select = new UICheckbox(false);
	select.dom.title = "select mode"
	select.onChange(function () {

		signals.selectModeChanged.dispatch(this.getValue() === true ? 'zones' : 'geometries');

	});
	container.add(select);

	// translate
	var translateIcon = document.createElement('img');
	translateIcon.title = strings.getKey('toolbar/translate');
	translateIcon.src = 'images/translate.svg';

	var translate = new UIButton();
	translate.dom.className = 'Button selected';
	translate.dom.appendChild(translateIcon);
	translate.onClick(function () {

		signals.transformModeChanged.dispatch('translate');

	});
	container.add(translate);

	// rotate
	var rotateIcon = document.createElement('img');
	rotateIcon.title = strings.getKey('toolbar/rotate');
	rotateIcon.src = 'images/rotate.svg';

	var rotate = new UIButton();
	rotate.dom.appendChild(rotateIcon);
	rotate.onClick(function () {

		signals.transformModeChanged.dispatch('rotate');

	});
	container.add(rotate);

	// scale
	var scaleIcon = document.createElement('img');
	scaleIcon.title = strings.getKey('toolbar/scale');
	scaleIcon.src = 'images/scale.svg';

	var scale = new UIButton();
	scale.dom.appendChild(scaleIcon);
	scale.onClick(function () {

		signals.transformModeChanged.dispatch('scale');

	});
	container.add(scale);

	// local / world
	var local = new UICheckbox(false);
	local.dom.title = strings.getKey('toolbar/local');
	local.onChange(function () {

		signals.spaceChanged.dispatch(this.getValue() === true ? 'local' : 'world');

	});
	container.add(local);

	//

	signals.transformModeChanged.add((mode) => {

		translate.dom.classList.remove('selected');
		rotate.dom.classList.remove('selected');
		scale.dom.classList.remove('selected');

		switch (mode) {

			case 'translate': translate.dom.classList.add('selected'); break;
			case 'rotate': rotate.dom.classList.add('selected'); break;
			case 'scale': scale.dom.classList.add('selected'); break;
			default: console.log(mode, "isn't supported"); break;

		}

	});

	return container;

}

export { Toolbar };
