import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue integer representing a hex color value
 * @constructor
 */
class SetMaterialColorCommand extends Command {
	constructor(editor, object, attributeName, newValue, materialSlot = 0) {
		super(editor);

		this.type = 'SetMaterialColorCommand';
		this.name = `Set Material.${attributeName}`;
		this.updatable = true;

		this.object = object;
		this.material =
			this.object !== undefined
				? this.editor.getObjectMaterial(object, materialSlot)
				: undefined;

		this.oldValue =
			this.material !== undefined ? this.material[attributeName].getHex() : undefined;
		this.newValue = newValue;

		this.attributeName = attributeName;
	}

	execute() {
		this.material[this.attributeName].setHex(this.newValue);

		this.editor.signals.materialChanged.dispatch(this.material, this.attributeName);
		this.editor.signals.objectChanged.dispatch(this.object, 'material');
	}

	undo() {
		this.material[this.attributeName].setHex(this.oldValue);

		this.editor.signals.materialChanged.dispatch(this.material, this.attributeName);
		this.editor.signals.objectChanged.dispatch(this.object, 'material');
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

export { SetMaterialColorCommand };
