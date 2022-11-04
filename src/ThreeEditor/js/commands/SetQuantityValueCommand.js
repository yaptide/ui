import { ScoringQuantity } from '../../util/Scoring/ScoringQuantity';
import { Command } from '../Command';

export class SetQuantityValueCommand extends Command {
	/**
	 * @param {Editor} editor
	 * @param {ScoringQuantity} object
	 * @param {keyof ScoringQuantity} attributeName
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

	toJSON() {
		const output = super.toJSON(this);
		output.object = this.object.toJSON();
		output.parentUuid = this.object?.parent.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object =
			this.editor.scoringManager
				.getOutputByUuid(json.parentUuid)
				.getQuantityByUuid(json.object.uuid) ?? ScoringQuantity.fromJSON(json.object);
	}
}
