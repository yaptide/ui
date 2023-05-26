import { Command } from '../Command.js';
import { Detector } from '../../Simulation/Detectors/Detector';

/**
 * @param editor Editor
 * @param zone DetectGeometry
 * @constructor
 */
export class RemoveDetectGeometryCommand extends Command {
	constructor(editor, object) {
		super(editor);

		this.type = 'RemoveDetectGeometryCommand';
		this.name = 'Remove Detect Geometry';

		this.object = object;
	}

	execute() {
		this.editor.detectorManager.removeDetector(this.object);
		this.editor.deselect();
	}

	undo() {
		this.editor.detectorManager.addDetector(this.object);
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
			Detector.fromJSON(this.editor, json.object);
	}
}
