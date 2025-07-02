import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object ScoringQuantity
 * @param newMaterialName String
 * @constructor
 */
class SetQuantityOverriddenMaterialCommand extends Command {
	constructor(editor, object, newIcru) {
		super(editor);

		this.type = 'SetQuantityOverriddenMaterialCommand';
		this.name = `Quantity applied simulation material: ${newIcru}`;

		this.object = object;

		this.oldIcru = object.material.icru;
		this.newIcru = newIcru;
	}

	execute() {
		const material = this.editor.materialManager.materials[this.newIcru];
		this.object.material = material;
		this.editor.signals.materialChanged.dispatch(material);
		this.editor.signals.objectChanged.dispatch(this.object, 'material');
	}

	undo() {
		const material = this.editor.materialManager.materials[this.oldIcru];
		this.object.material = material;
		this.editor.signals.materialChanged.dispatch(material);
		this.editor.signals.objectChanged.dispatch(this.object, 'material');
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.oldIcru = this.oldIcru;
		output.newIcru = this.newIcru;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldIcru = json.oldIcru;
		this.newIcru = json.newIcru;
	}
}

export { SetQuantityOverriddenMaterialCommand };
