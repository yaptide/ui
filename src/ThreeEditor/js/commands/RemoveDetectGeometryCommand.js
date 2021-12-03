import { Command } from '../Command.js';
import { DetectGeometry } from '../../util/Detect/DetectGeometry';

/**
 * @param editor Editor
 * @param zone DetectGeometry
 * @constructor
 */
export class RemoveDetectGeometryCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'RemoveDetectGeometryCommand';
		this.name = 'Remove Detect';

		this.object = object;
	}

	execute() {
		this.editor.detectManager.removeGeometry(this.object);
		this.editor.deselect();
	}

	undo() {
		this.editor.detectManager.addGeometry(this.object);
		this.editor.select(this.object);
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
			DetectGeometry.fromJSON(this.editor, json.object);
	}
}
