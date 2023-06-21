import * as THREE from 'three';

import { UIButton, UIColor, UIPanel, UIRow, UISelect, UIText } from '../libs/ui.js';
import { UITexture } from '../libs/ui.three.js';
import { SidebarProjectRenderer } from '../sidebar/Sidebar.Project.Renderer.js';
import { MenubarSettingsHistory } from './Menubar.Settings.History.js';
import { MenubarSettingsViewport } from './Menubar.Settings.Viewport.js';

const MenubarSettingsEvent = {
	close: 'closeMenubarSettings'
};

function MenubarSettings(editor) {
	const { signals, scene } = editor;

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add(new UIText('Settings'.toUpperCase()));
	const closeButton = new UIButton('Close')
		.onClick(() => {
			const event = new CustomEvent(MenubarSettingsEvent.close);
			container.dom.dispatchEvent(event);
		})
		.setMarginLeft('auto');
	headerRow.add(closeButton);
	container.add(headerRow);

	const settings = new UIPanel();
	settings.setBorderTop('0');
	settings.setPaddingTop('20px');
	container.add(settings);

	// background

	const backgroundRow = new UIRow();

	const backgroundType = new UISelect()
		.setOptions({
			None: '',
			Color: 'Color',
			Texture: 'Texture',
			Equirectangular: 'Equirect'
		})
		.setWidth('160px');
	backgroundType.onChange(() => {
		onBackgroundChanged();
		refreshBackgroundUI();
	});

	backgroundRow.add(new UIText('Background').setWidth('90px'));
	backgroundRow.add(backgroundType);

	const backgroundColor = new UIColor()
		.setValue('#000000')
		.setMarginLeft('8px')
		.onInput(onBackgroundChanged);
	backgroundRow.add(backgroundColor);

	const backgroundTexture = new UITexture().setMarginLeft('8px').onChange(onBackgroundChanged);
	backgroundTexture.setDisplay('none');
	backgroundRow.add(backgroundTexture);

	const backgroundEquirectangularTexture = new UITexture()
		.setMarginLeft('8px')
		.onChange(onBackgroundChanged);
	backgroundEquirectangularTexture.setDisplay('none');
	backgroundRow.add(backgroundEquirectangularTexture);

	settings.add(backgroundRow);

	function onBackgroundChanged() {
		signals.sceneBackgroundChanged.dispatch(
			backgroundType.getValue(),
			backgroundColor.getHexValue(),
			backgroundTexture.getValue(),
			backgroundEquirectangularTexture.getValue()
		);
	}

	function refreshBackgroundUI() {
		const type = backgroundType.getValue();

		backgroundType.setWidth(type === 'None' ? '160px' : '110px');
		backgroundColor.setDisplay(type === 'Color' ? '' : 'none');
		backgroundTexture.setDisplay(type === 'Texture' ? '' : 'none');
		backgroundEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none');
	}

	// environment

	const environmentRow = new UIRow();

	const environmentType = new UISelect()
		.setOptions({
			None: '',
			Equirectangular: 'Equirect',
			ModelViewer: 'ModelViewer'
		})
		.setWidth('160px');
	environmentType.setValue('None');
	environmentType.onChange(() => {
		onEnvironmentChanged();
		refreshEnvironmentUI();
	});

	environmentRow.add(new UIText('Environment').setWidth('90px'));
	environmentRow.add(environmentType);

	const environmentEquirectangularTexture = new UITexture()
		.setMarginLeft('8px')
		.onChange(onEnvironmentChanged);
	environmentEquirectangularTexture.setDisplay('none');
	environmentRow.add(environmentEquirectangularTexture);

	settings.add(environmentRow);

	function onEnvironmentChanged() {
		signals.sceneEnvironmentChanged.dispatch(
			environmentType.getValue(),
			environmentEquirectangularTexture.getValue()
		);
	}

	function refreshEnvironmentUI() {
		const type = environmentType.getValue();

		environmentType.setWidth(type !== 'Equirectangular' ? '160px' : '110px');
		environmentEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none');
	}

	//

	container.add(new MenubarSettingsViewport(editor));
	container.add(new MenubarSettingsHistory(editor));
	container.add(new SidebarProjectRenderer(editor));

	//

	function refreshUI() {
		if (scene.background) {
			if (scene.background.isColor) {
				backgroundType.setValue('Color');
				backgroundColor.setHexValue(scene.background.getHex());
			} else if (scene.background.isTexture) {
				if (scene.background.mapping === THREE.EquirectangularReflectionMapping) {
					backgroundType.setValue('Equirectangular');
					backgroundEquirectangularTexture.setValue(scene.background);
				} else {
					backgroundType.setValue('Texture');
					backgroundTexture.setValue(scene.background);
				}
			}
		} else {
			backgroundType.setValue('None');
		}

		if (scene.environment) {
			if (scene.environment.mapping === THREE.EquirectangularReflectionMapping) {
				environmentType.setValue('Equirectangular');
				environmentEquirectangularTexture.setValue(scene.environment);
			}
		} else {
			environmentType.setValue('None');
		}

		refreshBackgroundUI();
		refreshEnvironmentUI();
	}

	refreshUI();

	// events

	signals.editorCleared.add(refreshUI);

	signals.sceneGraphChanged.add(refreshUI);

	signals.objectChanged.add(refreshUI);

	return container;
}

export { MenubarSettings, MenubarSettingsEvent };
