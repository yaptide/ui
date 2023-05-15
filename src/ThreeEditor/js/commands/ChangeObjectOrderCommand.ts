import { Object3D, Event } from 'three';
import { Command } from '../Command.js';
import { Editor } from '../Editor.js';

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
	constructor(editor: Editor, object: THREE.Object3D, newIndex: number) {
		super(editor);

		if (!object.parent) throw new Error('The object does not have a parent.');

		this.type = 'ChangeObjectOrderCommand';
		this.object = object;
		this.newIndex = newIndex;
		this.parent = object.parent;
		this.oldIndex = object.parent.children.indexOf(object);

		if (this.oldIndex === -1) throw new Error('The object is not a child of the given parent.'); // should never happen.
	}

	execute() {
		this.changeOrderOfObject(this.object, this.newIndex, this.oldIndex);
	}

	undo() {
		this.changeOrderOfObject(this.object, this.oldIndex, this.newIndex);
	}

	private changeOrderOfObject(object: Object3D<Event>, newIndex: number, oldIndex: number) {
		if (newIndex === oldIndex)
			return console.warn('ChangeObjectOrderCommand: oldIndex and newIndex are the same.');

		const offset = newIndex >= oldIndex ? -1 : 0;
		this.parent.children.splice(oldIndex, 1);
		this.parent.children.splice(newIndex + offset, 0, object);
		this.editor.signals.objectChanged.dispatch(this.parent, 'children');
		this.editor.signals.sceneGraphChanged.dispatch();
	}

	toJSON() {
		const output = super.toJSON();

		output.object = this.object.uuid;
		output.oldIndex = this.oldIndex;
		output.newIndex = this.newIndex;

		return output;
	}

	fromJSON(json: { object: { object: { uuid: string } }; oldIndex: number; newIndex: number }) {
		super.fromJSON(json);
		const newObject = this.editor.objectByUuid(json.object.object.uuid);
		if (newObject) this.object = newObject;
		this.oldIndex = json.oldIndex;
		this.newIndex = json.newIndex;
	}
}
