import { UIPanel, UIButton, UICheckbox } from './libs/ui.js';

function Toolbar(editor) {
	const { signals } = editor;

	const container = new UIPanel();
	container.setId('toolbar');

	// translate
	const translateIcon = document.createElement('img');
	translateIcon.title = 'Translate';
	translateIcon.src = import.meta.env.PUBLIC_URL + '/images/translate.svg';

	const translate = new UIButton();
	translate.dom.className = 'Button selected';
	translate.dom.appendChild(translateIcon);
	translate.onClick(() => {
		signals.transformModeChanged.dispatch('translate');
	});
	container.add(translate);

	// rotate
	const rotateIcon = document.createElement('img');
	rotateIcon.title = 'Rotate';
	rotateIcon.src = import.meta.env.PUBLIC_URL + '/images/rotate.svg';

	const rotate = new UIButton();
	rotate.dom.appendChild(rotateIcon);
	rotate.onClick(() => {
		signals.transformModeChanged.dispatch('rotate');
	});
	container.add(rotate);

	// scale
	const scaleIcon = document.createElement('img');
	scaleIcon.title = 'Scale';
	scaleIcon.src = import.meta.env.PUBLIC_URL + '/images/scale.svg';

	const scale = new UIButton();
	scale.dom.appendChild(scaleIcon);
	scale.onClick(() => {
		signals.transformModeChanged.dispatch('scale');
	});
	container.add(scale);

	// local / world
	const local = new UICheckbox(false);
	local.dom.title = 'Local';
	local.onChange(() => {
		signals.spaceChanged.dispatch(local.getValue() === true ? 'local' : 'world');
	});
	container.add(local);

	//

	signals.transformModeChanged.add(mode => {
		translate.dom.classList.remove('selected');
		rotate.dom.classList.remove('selected');
		scale.dom.classList.remove('selected');

		switch (mode) {
			case 'translate':
				translate.dom.classList.add('selected');
				break;
			case 'rotate':
				rotate.dom.classList.add('selected');
				break;
			case 'scale':
				scale.dom.classList.add('selected');
				break;
			default:
				console.error(mode, "isn't supported");
				break;
		}
	});

	return container;
}

export { Toolbar };
