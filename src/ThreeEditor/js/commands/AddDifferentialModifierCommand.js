import { Command } from '../Command.js';
import { DifferentialModifier } from '../../util/Scoring/ScoringQtyModifiers';
import { ScoringQuantity } from '../../util/Scoring/ScoringQuantity';

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

	toJSON() {
		const output = super.toJSON(this);

		output.object = this.object.toJSON();
		output.modifier = this.modifier.toJSON();
		if (this.oldModifier) output.oldModifier = this.oldModifier.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.object =
			this.editor.detectManager.getGeometryByUuid(json.object.uuid) ??
			ScoringQuantity.fromJSON(this.editor, json.object);
		this.modifier = DifferentialModifier.fromJSON(json.modifier);
		if (json.oldModifier) this.oldModifier = DifferentialModifier.fromJSON(json.oldModifier);
	}
}
