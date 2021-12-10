import { Command } from '../Command.js';
import { DifferentialModifier } from '../../util/Scoring/ScoringQtyModifiers';
import { ScoringQuantity } from '../../util/Scoring/ScoringQuantity';

/**
 * @param editor Editor
 * @param object ScoringQuantity
 * @param modifier DifferentialModifier
 * @constructor
 */
export class AddDifferentialModifierCommand extends Command {
	constructor(editor, object, modifier) {
		super(editor);

		this.type = 'AddDifferentialModifierCommand';

		this.object = object;
		this.modifier = modifier;
		this.name = modifier ? `Update DifferentialModifier` : `Create DifferentialModifier`;
	}

	execute() {
		if (this.modifier) this.object.addModifier(this.modifier);
		else this.modifier = this.object.createModifier();
		this.object.selectedModifier = this.modifier;
		this.editor.signals.scoringQuantityChanged.dispatch(this.object);
	}

	undo() {
		this.editor.detectManager.removeGeometry(this.object);
		this.object.selectedModifier = null;
	}

	toJSON() {
		const output = super.toJSON(this);

		output.object = this.object.toJSON();
		output.modifier = this.modifier.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.object =
			this.editor.detectManager.getGeometryByUuid(json.object.uuid) ??
			ScoringQuantity.fromJSON(this.editor, json.object);
		this.modifier = DifferentialModifier.fromJSON(json.modifier);
	}
}
