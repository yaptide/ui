import { Object3D, Event } from 'three';
import { Command } from '../Command';
import { Editor } from '../Editor.js';

interface ChangeObjectOrderCommandJSON {
	oldIndex: number;
	newIndex: number;
	objectUuid: string;
	selectedUuid: string;
}

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newIndex number
 * @constructor
 */
export class ChangeObjectOrderCommand extends Command {
	object: THREE.Object3D;
	parent: THREE.Object3D;
	newIndex: number;
	oldIndex: number;
	oldSelect: THREE.Object3D | null;
	constructor(editor: Editor, object: THREE.Object3D, newIndex: number) {
		super(editor);

		if (!object.parent) throw new Error('The object does not have a parent.');

		this.type = 'ChangeObjectOrderCommand';
		this.object = object;
		this.newIndex = newIndex;
		this.parent = object.parent;
		this.oldIndex = object.parent.children.indexOf(object);
		this.oldSelect = editor.selected;

		if (this.oldIndex === -1) throw new Error('The object is not a child of the given parent.'); // should never happen.
	}

	execute() {
		this.changeOrderOfObject(this.object, this.newIndex, this.oldIndex);
		this.editor.select(this.object);
	}

	undo() {
		this.changeOrderOfObject(this.object, this.oldIndex, this.newIndex, true);
		this.editor.select(this.oldSelect);
	}

	private changeOrderOfObject(
		object: Object3D<Event>,
		newIndex: number,
		oldIndex: number,
		undo = false
	) {
		if (newIndex === oldIndex)
			return console.warn('ChangeObjectOrderCommand: oldIndex and newIndex are the same.');

		let oldOffset = (!undo && (oldIndex > newIndex ? 1 : 0)) || 0;

		let newOffset = (undo && (oldIndex > newIndex ? 0 : 1)) || 0;

		console.log('offset', oldOffset + oldIndex, newIndex + newOffset);
		this.parent.children.splice(newIndex + newOffset, 0, object);
		this.parent.children.splice(oldIndex + oldOffset, 1);
		this.editor.signals.objectChanged.dispatch(this.parent, 'children');
		this.editor.signals.sceneGraphChanged.dispatch();
	}

	toJSON() {
		const output: ChangeObjectOrderCommandJSON = {
			objectUuid: this.object.uuid,
			oldIndex: this.oldIndex,
			newIndex: this.newIndex,
			selectedUuid: this.editor.selected ? this.editor.selected.uuid : ''
		};

		return { ...super.toJSON(), output };
	}

	fromJSON(json: ChangeObjectOrderCommandJSON) {
		super.fromJSON(json);

		const found = this.editor.objectByUuid(json.objectUuid);

		if (!found) throw new Error('The object was not found in the scene.');

		this.object = found;
		this.oldIndex = json.oldIndex;
		this.newIndex = json.newIndex;

		this.oldSelect = this.editor.objectByUuid(json.selectedUuid) ?? null;
	}
}
