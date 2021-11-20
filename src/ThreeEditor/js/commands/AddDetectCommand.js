import { Command } from '../Command.js';
import { DetectGeometry } from '../../util/Detect/DetectGeometry';

/**
 * @param editor Editor
 * @param section DetectGeometry
 * @constructor
 */
export class AddDetectCommand extends Command {
	constructor(editor, section) {
		super(editor);

		this.type = 'AddDetectCommand';

		this.section = section;
		this.name = section ? `Add Section: ${section.name}` : `Create Section`;
	}

	execute() {
		if (this.section) this.editor.detectManager.addSection(this.section);
		else this.section = this.editor.detectManager.createSection();

		this.editor.select(this.section);
	}

	undo() {
		this.editor.detectManager.removeSection(this.section);
		this.editor.deselect();
	}

	toJSON() {
		const output = super.toJSON(this);

		output.section = this.section.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.section = this.editor.objectByUuid(json.section.uuid);

		if (this.section === undefined) {
			this.section = DetectGeometry.fromJSON(this.editor, json.object);
		}
	}
}
