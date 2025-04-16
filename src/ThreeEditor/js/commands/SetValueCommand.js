import { implementsUniqueChildrenNames } from '../../../util/Name/Name';
import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */
class SetValueCommand extends Command {
	constructor(editor, object, attributeName, newValue, sideEffect = false) {
		super(editor);

		this.type = 'SetValueCommand';
		this.name = `Set ${attributeName}`;
		this.updatable = !sideEffect;

		this.object = object;
		this.attributeName = attributeName;

		this.oldState = object.toSerialized();
		this.sideEffect = sideEffect;

		this.oldValue = object !== undefined ? object[attributeName] : undefined;
		this.newValue = newValue;

		if (attributeName === 'name') {
			if (implementsUniqueChildrenNames(object.parent)) {
				this.newValue = object.parent.uniqueNameForChild(object, this.newValue);
			}
		}
	}

	execute() {
		this.object[this.attributeName] = this.newValue;
		this.editor.signals.objectChanged.dispatch(this.object, this.attributeName);
	}

	undo() {
		this.object[this.attributeName] = this.oldValue;

		if (this.sideEffect) this.object.fromJSON(this.oldState);

		this.editor.signals.objectChanged.dispatch(this.object, this.attributeName);
	}

	update(cmd) {
		this.newValue = cmd.newValue;
	}

	toJSON() {
		const output = super.toJSON(this);

		output.oldState = this.oldState;
		output.sideEffect = this.sideEffect;
		output.objectUuid = this.object.uuid;
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
		this.oldState = json.oldState;
		this.sideEffect = json.sideEffect;
		this.object = this.editor.objectByUuid(json.objectUuid);
	}
}

export { SetValueCommand };
