import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue integer representing a hex color value
 * @constructor
 */
class SetColorCommand extends Command {
	constructor(editor, object, attributeName, newValue) {
		super(editor);

		this.type = 'SetColorCommand';
		this.name = `Set ${attributeName}`;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = object !== undefined ? this.object[this.attributeName].getHex() : undefined;
		this.newValue = newValue;
	}

	execute() {
		this.object[this.attributeName].setHex(this.newValue);
		this.editor.signals.objectChanged.dispatch(this.object);
	}

	undo() {
		this.object[this.attributeName].setHex(this.oldValue);
		this.editor.signals.objectChanged.dispatch(this.object);
	}

	update(cmd) {
		this.newValue = cmd.newValue;
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
	}
}

export { SetColorCommand };
