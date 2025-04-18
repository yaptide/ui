import { Command } from '../Command';

class SetMaterialVectorCommand extends Command {
	constructor(editor, object, attributeName, newValue, materialSlot) {
		super(editor);

		this.type = 'SetMaterialColorCommand';
		this.name = `Set Material.${attributeName}`;
		this.updatable = true;

		this.object = object;
		this.material = this.editor.getObjectMaterial(object, materialSlot);

		this.oldValue =
			this.material !== undefined ? this.material[attributeName].toArray() : undefined;
		this.newValue = newValue;

		this.attributeName = attributeName;
	}

	execute() {
		this.material[this.attributeName].fromArray(this.newValue);

		this.editor.signals.materialChanged.dispatch(this.material);
	}

	undo() {
		this.material[this.attributeName].fromArray(this.oldValue);

		this.editor.signals.materialChanged.dispatch(this.material);
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

export { SetMaterialVectorCommand };
