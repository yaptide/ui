import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */
class SetMaterialValueCommand extends Command {
	constructor(editor, object, attributeName, newValue, materialSlot = 0) {
		super(editor);

		this.type = 'SetMaterialValueCommand';
		this.name = `Set Material.${attributeName}`;
		this.updatable = true;

		this.object = object;
		this.material = this.editor.getObjectMaterial(object, materialSlot);

		this.oldValue = this.material !== undefined ? this.material[attributeName] : undefined;
		this.newValue = newValue;

		this.attributeName = attributeName;
	}

	execute() {
		this.material[this.attributeName] = this.newValue;
		this.material.needsUpdate = true;
		this.editor.signals.objectChanged.dispatch(this.object);
		this.editor.signals.materialChanged.dispatch(this.material);
		this.editor.signals.objectChanged.dispatch(this.material, this.attributeName);
	}

	undo() {
		this.material[this.attributeName] = this.oldValue;
		this.material.needsUpdate = true;

		this.editor.signals.objectChanged.dispatch(this.object);
		this.editor.signals.materialChanged.dispatch(this.material);
		this.editor.signals.objectChanged.dispatch(this.material, this.attributeName);
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

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object = this.editor.objectByUuid(json.objectUuid);
	}
}

export { SetMaterialValueCommand };
