import { Command } from '../Command.js';
import { Detector } from '../../Simulation/Detectors/Detector';

/**
 * @param editor Editor
 * @param object Detector
 * @constructor
 * @deprecated Use ObjectManagementFactory to create adder commands
 */
class AddDetectGeometryCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'AddDetectGeometryCommand';

		this.object = object;
		this.name = object ? `Add Detect Geometry: ${object.name}` : `Create Detect Geometry`;
	}

	execute() {
		if (this.object) this.editor.detectorManager.addDetector(this.object);
		else this.object = this.editor.detectorManager.createDetector();

		this.editor.select(this.object);
	}

	undo() {
		this.editor.detectorManager.removeDetector(this.object);
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
			this.editor.detectorManager.getDetectorByUuid(json.object.uuid) ??
			Detector.fromJSON(this.editor, json.object);
	}
}

export { AddDetectGeometryCommand };
