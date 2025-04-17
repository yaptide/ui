import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Command } from '../Command';

export class AddQuantityCommand extends Command {
	/**
	 * @param {YaptideEditor} editor
	 * @param {ScoringOutput} output
	 * @param {ScoringQuantity} [object]
	 * @constructor
	 * @deprecated Use ObjectManagementFactory to create adder commands
	 */
	constructor(editor, output, object) {
		super(editor);

		this.type = 'AddOutputCommand';

		this.object = object;
		this.output = output;
		this.name = object ? `Add Quantity: ${object.name}` : `Create Quantity`;
	}

	execute() {
		if (this.object) this.output.addQuantity(this.object);
		else this.object = this.output.createQuantity();

		this.editor.select(this.object);
	}

	undo() {
		this.output.removeQuantity(this.object);
		this.editor.deselect();
	}

	toSerialized() {
		const output = super.toSerialized(this);
		output.object = this.object.toSerialized();
		output.output = this.output.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);
		this.output =
			this.editor.scoringManager.getOutputByUuid(json.object.uuid) ??
			new ScoringOutput().fromSerialized(json.object);

		this.object =
			this.output.getQuantityByUuid(json.object.uuid) ??
			new ScoringQuantity().fromSerialized(json.object);
	}
}
