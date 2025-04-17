import { Detector } from '../../Simulation/Detectors/Detector';
import { Command } from '../Command';

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

	toSerialized() {
		const output = super.toSerialized(this);

		output.object = this.object.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object =
			this.editor.objectByUuid(json.object.uuid) ??
			Detector.fromSerialized(this.editor, json.object);
	}
}
