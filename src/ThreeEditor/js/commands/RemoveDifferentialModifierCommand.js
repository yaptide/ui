import { DifferentialModifier } from '../../Simulation/Scoring/ScoringQtyModifiers';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';

export class RemoveDifferentialModifierCommand {
	/**
	 * @param {Editor} editor
	 * @param {ScoringQuantity} object
	 * @param {DifferentialModifier} modifier
	 * @constructor
	 */
	constructor(editor, object, modifier) {
		this.editor = editor;
		this.object = object;
		this.modifier = modifier;

		this.type = 'RemoveDifferentialModifierCommand';
		this.name = 'RemoveDifferentialModifierCommand';
	}

	execute() {
		this.object.removeModifier(this.modifier);
		this.editor.signals.scoringQuantityChanged.dispatch(this.object);
		this.editor.signals.objectChanged.dispatch(this.object, 'modifiers');
	}

	undo() {
		this.object.addModifier(this.modifier);
		this.editor.signals.scoringQuantityChanged.dispatch(this.object);
		this.editor.signals.objectChanged.dispatch(this.object, 'modifiers');
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
			this.editor.detectorManager.getGeometryByUuid(json.object.uuid) ??
			ScoringQuantity.fromJSON(this.editor, json.object);
		this.modifier = DifferentialModifier.fromJSON(json.modifier);
	}
}
