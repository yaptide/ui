import { Command } from '../Command.js';
import { Vector3 } from 'three';

/**
 * @param editor Editor
 * @param newDirection THREE.Vector3
 * @param optionalOldDirection THREE.Vector3
 * @constructor
 */
export class SetBeamDirectionCommand extends Command {
	constructor(editor, newDirection, optionalOldDirection) {
		super(editor);

		this.type = 'SetBeamDirectionCommand';
		this.name = 'Set Direction';
		this.updatable = true;

		const { beam } = editor;

		this.object = beam;

		if (newDirection !== undefined) {
			this.oldDirection = beam.direction.clone();
			this.newDirection = newDirection.clone();
		}

		if (optionalOldDirection !== undefined) {
			this.oldDirection = optionalOldDirection.clone();
		}
	}

	execute() {
		const { beam } = this.editor;
		beam.direction.copy(this.newDirection);
		beam.updateMatrixWorld(true);
		this.editor.signals.objectChanged.dispatch(beam);
	}

	undo() {
		const { beam } = this.editor;
		beam.direction.copy(this.oldDirection);
		beam.updateMatrixWorld(true);
		this.editor.signals.objectChanged.dispatch(beam);
	}

	update(command) {
		this.newDirection.copy(command.newDirection);
	}

	toJSON() {
		const output = super.toJSON(this);

		output.objectUuid = this.object.uuid;
		output.oldDirection = this.oldDirection.toArray();
		output.newDirection = this.newDirection.toArray();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldDirection = new Vector3().fromArray(json.oldDirection);
		this.newDirection = new Vector3().fromArray(json.newDirection);
	}
}
