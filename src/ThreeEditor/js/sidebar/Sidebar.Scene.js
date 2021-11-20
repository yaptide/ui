import * as THREE from 'three';

import { UIPanel, UIBreak, UIRow, UIColor, UISelect, UIText } from '../libs/ui.js';
import { UIOutliner, UITexture } from '../libs/ui.three.js';

function SidebarScene(editor) {
	const { signals, strings } = editor;

	const container = new UIPanel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	// outliner

	const nodeStates = new WeakMap();

	function buildOption(object, draggable) {
		const option = document.createElement('div');
		option.draggable = draggable;
		option.innerHTML = buildHTML(object);
		option.value = object.id;

		// opener

		if (nodeStates.has(object)) {
			const state = nodeStates.get(object);

			const opener = document.createElement('span');
			opener.classList.add('opener');

			if (object.children.length > 0) {
				opener.classList.add(state ? 'open' : 'closed');
			}

			opener.addEventListener(
				'click',
				() => {
					nodeStates.set(object, nodeStates.get(object) === false); // toggle
					refreshUI();
				},
				false
			);

			option.insertBefore(opener, option.firstChild);
		}

		return option;
	}

	function getMaterialName(material) {
		if (Array.isArray(material)) {
			const array = [];

			for (let i = 0; i < material.length; i++) {
				array.push(material[i].name);
			}

			return array.join(',');
		}

		return material.name;
	}

	function escapeHTML(html) {
		return html
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function getObjectType(object) {
		if (object.isDetectGeometry) return 'Line';
		if (object.isZone) return 'Points';
		if (object.isZoneContainer) return 'Camera';
		if (object.isDetectGeometryContainer) return 'Line';
		//TODO: Add support to different keywords in css classes  # skipcq: JS-0099
		if (object.isScene) return 'Scene';
		if (object.isCamera) return 'Camera';
		if (object.isLight) return 'Light';
		if (object.isMesh) return 'Mesh';
		if (object.isLine) return 'Line';
		if (object.isPoints) return 'Points';

		return 'Object3D';
	}

	function buildHTML(object) {
		let html = `<span class="type ${getObjectType(object)}"></span> ${escapeHTML(object.name)}`;

		if (object.isMesh) {
			const geometry = object.geometry;
			const material = object.material;

			html += ` <span class="type Geometry"></span> ${escapeHTML(geometry.name)}`;
			html += ` <span class="type Material"></span> ${escapeHTML(getMaterialName(material))}`;
		}

		html += getScript(object.uuid);

		return html;
	}

	function getScript(uuid) {
		if (editor.scripts[uuid] !== undefined) {
			return ' <span class="type Script"></span>';
		}

		return '';
	}

	let ignoreObjectSelectedSignal = false;

	const outliner = new UIOutliner(editor);
	outliner.setId('outliner');
	outliner.onChange(() => {
		ignoreObjectSelectedSignal = true;

		editor.selectById(parseInt(outliner.getValue()));

		ignoreObjectSelectedSignal = false;
	});
	outliner.onDblClick(() => {
		editor.focusById(parseInt(outliner.getValue()));
	});
	container.add(outliner);
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
		.setWidth('150px');
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

		backgroundType.setWidth(type === 'None' ? '150px' : '110px');
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
		.setWidth('150px');
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

		environmentType.setWidth(type !== 'Equirectangular' ? '150px' : '110px');
		environmentEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none');
	}

	//

	function refreshUI() {
		const { camera, scene } = editor;
		const { detGeoContainer } = editor.detectManager;
		const { zoneContainer, worldZone } = editor.zoneManager;

		const options = [];

		options.push(buildOption(camera, false));
		options.push(buildOption(scene, false));

		function addObjects(objects, pad) {
			for (let i = 0, l = objects.length; i < l; i++) {
				const object = objects[i];

				if (nodeStates.has(object) === false) {
					nodeStates.set(object, false);
				}

				const option = buildOption(object, true);
				option.style.paddingLeft = pad * 18 + 'px';
				options.push(option);

				if (nodeStates.get(object) === true) {
					addObjects(object.children, pad + 1);
				}
			}
		}
		addObjects(scene.children, 0);

		options.push(buildOption(zoneContainer, false));
		addObjects(zoneContainer.children, 0);

		options.push(buildOption(detGeoContainer, false));
		addObjects(detGeoContainer.children, 0);

		options.push(buildOption(worldZone, false));

		options.push(buildOption(editor.beam, false));

		outliner.setOptions(options);

		if (editor.selected !== null) {
			outliner.setValue(editor.selected.id);
		}

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

	signals.objectSelected.add(object => {
		if (ignoreObjectSelectedSignal === true) return;

		if (object !== null && object.parent !== null && !object.parent?.isZoneManager) {
			let needsRefresh = false;
			let nextParent = object.parent;

			const reachedFinalParent = parent => {
				const finalParents = [
					editor.camera,
					editor.scene,
					editor.beam,
					editor.zoneManager.zoneContainer,
					editor.zoneManager.worldZone,
					editor.detectManager.detGeoContainer
				];
				return finalParents.some(finalParent => finalParent === parent);
			};

			while (!reachedFinalParent(nextParent)) {
				if (nodeStates.get(object, nextParent) !== true) {
					if (!nextParent) {
						console.error(nextParent);
						throw new Error(
							`nextParent is ${nextParent === null ? 'null' : typeof nextParent}`
						);
					}
					nodeStates.set(nextParent, true);
					needsRefresh = true;
				}

				nextParent = nextParent.parent;
			}

			if (needsRefresh) refreshUI();

			outliner.setValue(object.id);
		} else {
			outliner.setValue(null);
		}
	});

	return container;
}

export { SidebarScene };
