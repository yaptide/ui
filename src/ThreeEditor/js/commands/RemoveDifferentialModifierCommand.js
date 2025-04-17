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

	toSerialized() {
		const output = super.toSerialized(this);
		output.object = this.object.toSerialized();
		output.modifier = this.modifier.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);
		this.object =
			this.editor.detectorManager.getGeometryByUuid(json.object.uuid) ??
			ScoringQuantity.fromSerialized(this.editor, json.object);
		this.modifier = DifferentialModifier.fromSerialized(json.modifier);
	}
}
