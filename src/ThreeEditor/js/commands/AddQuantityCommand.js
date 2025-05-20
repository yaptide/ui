import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import createScoringOutput from '../../Simulation/Scoring/ScoringOutputFactory';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import createScoringQuantity from '../../Simulation/Scoring/ScoringQuantityFactory';
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
			createScoringOutput(this.editor).fromSerialized(json.object);

		this.object =
			this.output.getQuantityByUuid(json.object.uuid) ??
			createScoringQuantity(this.editor, json.object);
	}
}
