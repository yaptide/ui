import { Command } from '../Command.js';
import { DetectGeometry } from '../../util/Detect/DetectGeometry';

/**
 * @param editor Editor
 * @param object DetectGeometry
 * @constructor
 */
class AddDetectGeometryCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'AddDetectGeometryCommand';

		this.object = object;
		this.name = object ? `Add Detect Geometry: ${object.name}` : `Create Detect Geometry`;
	}

	execute() {
		if (this.object) this.editor.detectManager.addGeometry(this.object);
		else this.object = this.editor.detectManager.createGeometry();

		this.editor.select(this.object);
	}

	undo() {
		this.editor.detectManager.removeGeometry(this.object);
		this.editor.deselect();
	}

	toJSON() {
		const output = super.toJSON(this);

		output.object = this.object.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object = this.editor.objectByUuid(json.object.object.uuid);

		if (this.object === undefined) {
			this.object = DetectGeometry.fromJSON(this.editor, json.object);
		}
	}
}

export { AddDetectGeometryCommand };
