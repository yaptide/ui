import * as THREE from 'three';
import {
	AddObjectCommand,
	RemoveObjectCommand,
	RemoveZoneCommand,
	RemoveDetectCommand,
	SetPositionCommand,
} from './commands/Commands';
import { UIHorizontalRule, UIPanel, UIRow } from './libs/ui.js';

function MenubarEdit(editor) {
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent(strings.getKey('menubar/edit'));
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// Undo

	const undo = new UIRow();
	undo.setClass('option');
	undo.setTextContent(strings.getKey('menubar/edit/undo'));
	undo.onClick(() => {
		editor.undo();
	});
	options.add(undo);

	// Redo

	const redo = new UIRow();
	redo.setClass('option');
	redo.setTextContent(strings.getKey('menubar/edit/redo'));
	redo.onClick(() => {
		editor.redo();
	});
	options.add(redo);

	// Clear History

	let option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/edit/clear_history'));
	option.onClick(() => {
		if (window.confirm('The Undo/Redo History will be cleared. Are you sure?')) {
			editor.history.clear();
		}
	});
	options.add(option);

	editor.signals.historyChanged.add(() => {
		const { history } = editor;

		undo.setClass('option');
		redo.setClass('option');

		if (history.undos.length === 0) {
			undo.setClass('inactive');
		}

		if (history.redos.length === 0) {
			redo.setClass('inactive');
		}
	});

	// ---

	options.add(new UIHorizontalRule());

	// Center

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/edit/center'));
	option.onClick(() => {
		const object = editor.selected;

		if (object === null || object.parent === null) return; // avoid centering the camera or scene

		const aabb = new THREE.Box3().setFromObject(object);
		const center = aabb.getCenter(new THREE.Vector3());
		const newPosition = new THREE.Vector3();

		newPosition.x = object.position.x + (object.position.x - center.x);
		newPosition.y = object.position.y + (object.position.y - center.y);
		newPosition.z = object.position.z + (object.position.z - center.z);

		editor.execute(new SetPositionCommand(editor, object, newPosition));
	});
	options.add(option);

	// Clone

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/edit/clone'));
	option.onClick(() => {
		let object = editor.selected;

		if (object === null || object.parent === null) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.execute(new AddObjectCommand(editor, object));
	});
	options.add(option);

	// Delete

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/edit/delete'));
	option.onClick(() => {
		const object = editor.selected;

		if (object !== null && object.parent !== null && object.notRemovable !== true) {
			if (object?.isZone) editor.execute(new RemoveZoneCommand(editor, object));
			else if (object?.isDetectGeometry) editor.execute(new RemoveDetectCommand(editor, object));
			else editor.execute(new RemoveObjectCommand(editor, object));
		}
	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());

	// Set textures to sRGB. See #15903

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/edit/fixcolormaps'));
	option.onClick(() => {
		editor.scene.traverse(fixColorMap);
	});
	options.add(option);

	const colorMaps = ['map', 'envMap', 'emissiveMap'];

	function fixColorMap(obj) {
		const material = obj.material;

		if (material !== undefined) {
			if (Array.isArray(material) === true) {
				for (let i = 0; i < material.length; i++) {
					fixMaterial(material[i]);
				}
			} else {
				fixMaterial(material);
			}

			editor.signals.sceneGraphChanged.dispatch();
		}
	}

	function fixMaterial(material) {
		let needsUpdate = material.needsUpdate;

		for (let i = 0; i < colorMaps.length; i++) {
			const map = material[colorMaps[i]];

			if (map) {
				map.encoding = THREE.sRGBEncoding;
				needsUpdate = true;
			}
		}

		material.needsUpdate = needsUpdate;
	}

	return container;
}

export { MenubarEdit };
