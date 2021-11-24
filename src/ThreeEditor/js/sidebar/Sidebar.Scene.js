import * as THREE from 'three';
import { UIBreak, UIColor, UIPanel, UIRow, UISelect, UIText } from '../libs/ui.js';
import { UITexture } from '../libs/ui.three.js';
import { OutlinerManager } from './Sidebar.OutlinerManager';



function SidebarScene(editor) {
	const { signals, strings } = editor;

	const container = new UIPanel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	const outlinerManager = new OutlinerManager(editor, container);
	outlinerManager.id = 'outliner';

	const refreshOptions = function () {
		const sources = [
			editor.scene,
			editor.zoneManager.zoneContainer,
			editor.zoneManager.worldZone,
			editor.beam
		];
		outlinerManager.setOptionsFromSources(sources);
	};

	container.add(new UIBreak());

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

	backgroundRow.add(new UIText(strings.getKey('sidebar/scene/background')).setWidth('90px'));
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

	container.add(backgroundRow);

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

	environmentRow.add(new UIText(strings.getKey('sidebar/scene/environment')).setWidth('90px'));
	environmentRow.add(environmentType);

	const environmentEquirectangularTexture = new UITexture()
		.setMarginLeft('8px')
		.onChange(onEnvironmentChanged);
	environmentEquirectangularTexture.setDisplay('none');
	environmentRow.add(environmentEquirectangularTexture);

	container.add(environmentRow);

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

	function refreshUI() {
		const { camera, scene } = editor;
		const { detectContainer } = editor.detectManager;
		const { zoneContainer, worldZone } = editor.zoneManager;

		refreshOptions();

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

export { SidebarScene };

