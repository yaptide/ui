import { ObjectLoader } from 'three';

import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
class RemoveObjectCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'RemoveObjectCommand';
		this.name = 'Remove Object';

		this.object = object;
		this.parent = object !== undefined ? object.parent : undefined;

		if (this.parent !== undefined) {
			this.index = this.parent.children.indexOf(this.object);
		}
	}

	execute() {
		this.editor.removeObject(this.object);
		this.editor.deselect();
	}

	undo() {
		this.editor.addObject(this.object, this.parent, this.index);
		this.editor.select(this.object);
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.object = this.object.toSerialized();
		output.index = this.index;
		output.parentUuid = this.parent.uuid;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.parent = this.editor.objectByUuid(json.parentUuid);

		if (this.parent === undefined) {
			this.parent = this.editor.figureManager;
		}

		this.index = json.index;

		this.object = this.editor.objectByUuid(json.object.object.uuid);

		if (this.object === undefined) {
			const loader = new ObjectLoader();
			this.object = loader.parse(json.object);
		}
	}
}

export { RemoveObjectCommand };
