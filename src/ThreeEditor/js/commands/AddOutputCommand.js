import { Command } from '../Command.js';
import { ScoringOutput } from '../../util/Scoring/ScoringOutput';

export class AddOutputCommand extends Command {
	/**
	 * @param editor Editor
	 * @param object ScoringOutput
	 * @constructor
	 */
	constructor(editor, object) {
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

	toJSON() {
		const output = super.toJSON(this);
		output.object = this.object.toJSON();
		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.object =
			this.editor.scoringManager.getOutputByUuid(json.object.uuid) ??
			new ScoringOutput().fromJSON(json.object);
	}
}
