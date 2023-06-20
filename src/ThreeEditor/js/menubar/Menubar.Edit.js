import * as THREE from 'three';
import {
	AddObjectCommand,
	RemoveDetectGeometryCommand,
	RemoveFilterCommand,
	RemoveObjectCommand,
	RemoveZoneCommand,
	SetPositionCommand
} from '../commands/Commands';
import { UIHorizontalRule, UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarEdit(editor) {
	const { history, signals } = editor;

	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Edit');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// History
	const undo = createOption('option', 'Undo (Ctrl+Z)', editor.undo);
	const redo = createOption('option', 'Redo (Ctrl+Shift+Z)', editor.redo);
	signals.historyChanged.add(() => {
		undo.setClass(history.undos.length === 0 ? 'inactive' : 'option');
		redo.setClass(history.redos.length === 0 ? 'inactive' : 'option');
	});
	options.add(
		undo,
		redo,
		createOption('option', 'Clear History', () => {
			if (window.confirm('The Undo/Redo History will be cleared. Are you sure?')) {
				editor.history.clear();
			}
		}),
		new UIHorizontalRule()
	);

	// Object
	const getRemoveCommand = (editor, object) => {
		switch (true) {
			case object.isDetector:
				return new RemoveDetectGeometryCommand(editor, object);
			case object.isZone:
				return new RemoveZoneCommand(editor, object);
			case object.isFilter:
				return new RemoveFilterCommand(editor, object);
			default:
				return new RemoveObjectCommand(editor, object);
		}
	};
	const isRemovableOrCloneable = object => object && object.parent && !object.notRemovable;
	options.add(
		createOption('option', 'Center', () => {
			const object = editor.selected;
			if (object === null || object.notMovable) return; // avoid centering the camera or scene

			const center = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
			const newPosition = new THREE.Vector3();

			newPosition.x = object.position.x + (object.position.x - center.x);
			newPosition.y = object.position.y + (object.position.y - center.y);
			newPosition.z = object.position.z + (object.position.z - center.z);

			editor.execute(new SetPositionCommand(editor, object, newPosition));
		}),
		createOption('option', 'Clone', () => {
			let object = editor.selected;
			if (!isRemovableOrCloneable(object)) return; // avoid cloning unique objects

			object = object.clone();
			editor.execute(new AddObjectCommand(editor, object));
		}),
		createOption('option', 'Delete (Del)', () => {
			let object = editor.selected;
			if (!isRemovableOrCloneable(object)) return; // avoid deleting unique objects

			editor.execute(getRemoveCommand(editor, object));
		})
	);

	return container;
}

export { MenubarEdit };
