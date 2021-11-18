import { Command } from '../Command.js';
import { DetectSection } from '../../util/Detect/DetectSection'

/**
 * @param editor Editor
 * @param object DetectSection
 * @constructor
 */
class AddDetectSectionCommand extends Command {

	constructor(editor, section) {

		super(editor);

		this.type = 'AddDetectGeometryCommand';

		this.section = section;
		this.name = section
			? `Add Section: ${section.name}`
			: `Create Section`;

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

		output.object = this.section.toJSON();

		return output;

	}

	fromJSON(json) {

		super.fromJSON(json);

		this.section = this.editor.objectByUuid(json.object.object.uuid);

		if (this.section === undefined) {
			
			this.section = DetectSection.fromJSON( this.editor, json.object );

		}

	}

}

export { AddDetectSectionCommand };
