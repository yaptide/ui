import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Command } from '../Command.js';
export class RemoveQuantityCommand extends Command {
	/**
	 * @typedef {import('../Editor.js').Editor} Editor
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

	toJSON() {
		const output = super.toJSON(this);
		output.object = this.object.toJSON();
		output.output = this.output.toJSON();
		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.output =
			this.editor.scoringManager.getOutputByUuid(json.object.uuid) ??
			new ScoringOutput().fromJSON(json.object);
		this.object =
			this.output.getQuantityByUuid(json.object.uuid) ??
			new ScoringQuantity().fromJSON(json.object);
	}
}
