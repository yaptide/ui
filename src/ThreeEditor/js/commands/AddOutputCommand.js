import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import { Command } from '../Command';

export class AddOutputCommand extends Command {
	// type object is optional

	/**
	 * @param {Editor} editor
	 * @param {ScoringOutput} [object]
	 * @constructor
	 * @deprecated Use ObjectManagementFactory to create adder commands
	 */
	constructor(editor, object = undefined) {
		super(editor);

		this.type = 'AddOutputCommand';

		this.object = object;
		this.name = object ? `Add Output: ${object.name}` : `Create Output`;
	}

	execute() {
		if (this.object) this.editor.scoringManager.addOutput(this.object);
		else this.object = this.editor.scoringManager.createOutput();

		this.editor.select(this.object);
	}

	undo() {
		this.editor.scoringManager.removeOutput(this.object);
		this.editor.deselect();
	}

	toSerialized() {
		const output = super.toSerialized(this);
		output.object = this.object.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);
		this.object =
			this.editor.scoringManager.getOutputByUuid(json.object.uuid) ??
			new ScoringOutput().fromSerialized(json.object);
	}
}
