import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object ScoringOutput
 * @param newPosition THREE.Vector3
 * @param optionalOldPosition THREE.Vector3
 * @constructor
 */
export class SetOutputSettingsCommand extends Command {
	constructor(editor, object, settingName, newValue) {
		super(editor);

		this.type = 'SetOutputSettings';
		this.name = `Set ${settingName}`;

		this.object = object;
		this.attributeName = settingName;

		this.oldValue = object !== undefined ? object[settingName] : undefined;
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
			this.editor.scoringManager.getObjectByUuid(json.object.uuid) ??
			ScoringOutput.fromSerialized(json.object);
	}
}
