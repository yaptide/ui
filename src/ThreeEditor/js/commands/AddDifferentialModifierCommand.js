import { DifferentialModifier } from '../../Simulation/Scoring/ScoringQtyModifiers';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Command } from '../Command';

export class AddDifferentialModifierCommand extends Command {
	/**
	 * @param {Editor} editor
	 * @param {ScoringQuantity} object
	 * @param {DifferentialModifier} [modifier]
	 * @constructor
	 */
	constructor(editor, object, modifier) {
		super(editor);

		this.type = 'AddDifferentialModifierCommand';

		this.object = object;
		this.modifier = modifier;

		if (this.modifier) this.oldModifier = object.getModifierByUuid(modifier.uuid);
		this.name = modifier ? `Update DifferentialModifier` : `Create DifferentialModifier`;
	}

	execute() {
		if (this.modifier) this.object.addModifier(this.modifier);
		else this.modifier = this.object.createModifier();
		this.object.selectedModifier = this.modifier;
		this.editor.signals.scoringQuantityChanged.dispatch(this.object);
		this.editor.signals.objectChanged.dispatch(this.object, 'modifiers');
		this.editor.signals.objectChanged.dispatch(this.object, 'selectedModifier');
	}

	undo() {
		if (this.oldModifier) this.object.addModifier(this.oldModifier);
		this.object.removeModifier(this.modifier);
		this.object.selectedModifier = null;
		this.editor.signals.scoringQuantityChanged.dispatch(this.object);
		this.editor.signals.objectChanged.dispatch(this.object, 'modifiers');
		this.editor.signals.objectChanged.dispatch(this.object, 'selectedModifier');
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.object = this.object.toSerialized();
		output.modifier = this.modifier.toSerialized();

		if (this.oldModifier) output.oldModifier = this.oldModifier.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);
		this.object =
			this.editor.detectorManager.getDetectorByUuid(json.object.uuid) ??
			ScoringQuantity.fromSerialized(this.editor, json.object);
		this.modifier = DifferentialModifier.fromSerialized(json.modifier);

		if (json.oldModifier)
			this.oldModifier = DifferentialModifier.fromSerialized(json.oldModifier);
	}
}
