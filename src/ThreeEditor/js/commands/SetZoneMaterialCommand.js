import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newMaterialName String
 * @constructor
 */
class SetZoneMaterialCommand extends Command {
	constructor(editor, object, newMaterialName) {
		super(editor);

		this.type = 'SetZoneMaterialCommand';
		this.name = 'New Material';

		this.object = object;

		this.oldMaterialName = this.editor.getObjectMaterial(object).name;
		this.newMaterialName = newMaterialName;
	}

	execute() {
		const material = this.editor.materialsManager.materials[this.newMaterialName];
		this.editor.setObjectMaterial(this.object, 0, material);
		this.editor.signals.materialChanged.dispatch(material);
		this.editor.signals.objectChanged.dispatch(this.object);
	}

	undo() {
		const material = this.editor.materialsManager.materials[this.oldMaterialName];
		this.editor.setObjectMaterial(this.object, 0, material);
		this.editor.signals.materialChanged.dispatch(material);
		this.editor.signals.objectChanged.dispatch(this.object);
	}

	toJSON() {
		const output = super.toJSON(this);

		output.objectUuid = this.object.uuid;
		output.oldMaterialName = this.oldMaterialName;
		output.newMaterialName = this.newMaterialName;

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldMaterialName = json.oldMaterialName;
		this.newMaterialName = json.newMaterialName;
	}
}

export { SetZoneMaterialCommand };
