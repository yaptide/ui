import { ObjectLoader } from 'three';

import { Command } from '../Command';
/**
 * @typedef {import('../YaptideEditor.js').YaptideEditor} Editor
 */
export class AddObjectCommand extends Command {
	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D} object
	 * @constructor
	 * @deprecated Use ObjectManagementFactory to create adder commands
	 */
	constructor(editor, object) {
		super(editor);

		this.type = 'AddObjectCommand';

		this.object = object;

		if (object !== undefined) {
			this.name = `Add Object: ${object.name}`;
		}
	}

	execute() {
		this.editor.addObject(this.object);
		this.editor.select(this.object);
	}

	undo() {
		this.editor.removeObject(this.object);
		this.editor.deselect();
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.object = this.object.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.object.object.uuid);

		if (this.object === undefined) {
			const loader = new ObjectLoader();
			this.object = loader.parse(json.object);
		}
	}
}
