import { GeantScoringQuantity } from '../../Simulation/Scoring/GeantScoringQuantity';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Command } from '../Command';

export class SetQuantityValueCommand extends Command {
	/**
	 * @param {Editor} editor
	 * @param {IWannaBeQuantity} object
	 * @param {keyof ScoringQuantity|keyof GeantScoringQuantity} attributeName
	 * @param {unknown} newValue
	 * @constructor
	 */
	constructor(editor, object, attributeName, newValue) {
		super(editor);

		this.type = 'SetQuantitySettings';
		this.name = `Set ${attributeName}`;

		this.object = object;
		this.attributeName = attributeName;

		this.oldValue = object !== undefined ? object[attributeName] : undefined;
		this.newValue = newValue;
	}

	execute() {
		this.object[this.attributeName] = this.newValue;
		this.editor.signals.objectChanged.dispatch(this.object, this.attributeName);
	}

	undo() {
		this.object[this.attributeName] = this.oldValue;
		this.editor.signals.objectChanged.dispatch(this.object, this.attributeName);
	}

	update(cmd) {
		this.newValue = cmd.newValue;
	}

	toSerialized() {
		const output = super.toSerialized(this);
		output.object = this.object.toSerialized();
		output.parentUuid = this.object?.parent.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object =
			this.editor.scoringManager
				.getOutputByUuid(json.parentUuid)
				.getQuantityByUuid(json.object.uuid) ?? ScoringQuantity.fromSerialized(json.object);
	}
}
