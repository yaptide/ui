import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import createScoringOutput from '../../Simulation/Scoring/ScoringOutputFactory';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Command } from '../Command';

export class RemoveQuantityCommand extends Command {
	/**
	 * @typedef {import('../YaptideEditor.js').YaptideEditor} Editor
	 * @param {Editor} editor
	 * @param {ScoringQuantity} object
	 * @param {ScoringOutput} output
	 * @constructor
	 */
	constructor(editor, object, output) {
		super(editor);

		this.type = 'RemoveQuantityCommand';

		this.object = object;
		this.output = output;
		this.name = `RemoveQuantityCommand`;
	}

	execute() {
		this.output.removeQuantity(this.object);
		this.editor.deselect();
	}

	undo() {
		this.output.addQuantity(this.object);
		this.editor.select(this.object);
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
			new ScoringQuantity().fromSerialized(json.object);
	}
}
