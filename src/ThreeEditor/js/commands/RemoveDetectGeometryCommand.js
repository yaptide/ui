import { Command } from '../Command.js';
import { DetectGeometry } from '../../util/Detect/DetectGeometry';

/**
 * @param editor Editor
 * @param zone DetectGeometry
 * @constructor
 */
export class RemoveDetectGeometryCommand extends Command {
	constructor(editor, detect) {
		super(editor);

		this.type = 'RemoveDetectGeometryCommand';
		this.name = 'Remove Detect';

		this.detect = detect;

		this.object = detect;
	}

	execute() {
		this.editor.detectManager.removeGeometry(this.detect);
		this.editor.deselect();
	}

	undo() {
		this.editor.detectManager.addGeometry(this.detect);
		this.editor.select(this.detect);
	}

	toJSON() {
		const output = super.toJSON(this);

		output.section = this.detect.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.detect = this.editor.objectByUuid(json.object.section.uuid);

		if (this.detect === undefined) {
			this.detect = DetectGeometry.fromJSON(this.editor, json.object);
		}
	}
}
