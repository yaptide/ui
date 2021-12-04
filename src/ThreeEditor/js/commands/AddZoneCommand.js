import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
export class AddZoneCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'AddZoneCommand';

		this.object = object;
		this.name = object ? `Add Zone: ${object.name}` : `Create Zone`;
	}

	execute() {
		if (this.object) this.editor.zoneManager.addZone(this.object);
		else this.object = this.editor.zoneManager.createZone();

		this.editor.select(this.object);
	}

	undo() {
		this.editor.zoneManager.removeZone(this.object);
		this.editor.deselect();
	}

	toJSON() {
		const output = super.toJSON(this);

		output.object = this.object.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object =
			this.editor.objectByUuid(json.object.uuid) ??
			this.editor.zoneManager.createZone().fromJSON(this.editor, json.object);
	}
}
