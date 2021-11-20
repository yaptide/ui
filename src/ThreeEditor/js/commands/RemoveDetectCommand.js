import { Command } from '../Command.js';
import { DetectGeometry } from '../../util/Detect/DetectGeometry';

/**
 * @param editor Editor
 * @param zone DetectGeometry
 * @constructor
 */
export class RemoveDetectCommand extends Command {
	constructor(editor, section) {
		super(editor);

		this.type = 'RemoveDetectCommand';
		this.name = 'Remove Detect';

		this.section = section;
	}

	execute() {
		this.editor.detectManager.removeSection(this.section);
		this.editor.deselect();
	}

	undo() {
		this.editor.detectManager.addSection(this.section);
		this.editor.select(this.section);
	}

	toJSON() {
		const output = super.toJSON(this);

		output.section = this.section.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.section = this.editor.objectByUuid(json.object.section.uuid);

		if (this.section === undefined) {
			this.section = DetectGeometry.fromJSON(this.editor, json.object);
		}
	}
}
