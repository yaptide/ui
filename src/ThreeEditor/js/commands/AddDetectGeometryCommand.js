import { Command } from '../Command.js';
import { DetectGeometry } from '../../util/Detect/DetectGeometry';

/**
 * @param editor Editor
 * @param object DetectGeometry
 * @constructor
 */
class AddDetectGeometryCommand extends Command {
	constructor(editor, geometry) {
		super(editor);

		this.type = 'AddDetectGeometryCommand';

		this.geometry = geometry;
		this.name = geometry ? `Add Section: ${geometry.name}` : `Create Section`;
	}

	execute() {
		if (this.geometry) this.editor.detectManager.addSection(this.geometry);
		else this.geometry = this.editor.detectManager.createSection();

		this.editor.select(this.geometry);
	}

	undo() {
		this.editor.detectManager.removeSection(this.geometry);
		this.editor.deselect();
	}

	toJSON() {
		const output = super.toJSON(this);

		output.object = this.geometry.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.geometry = this.editor.objectByUuid(json.object.object.uuid);

		if (this.geometry === undefined) {
			this.geometry = DetectGeometry.fromJSON(this.editor, json.object);
		}
	}
}

export { AddDetectGeometryCommand };
