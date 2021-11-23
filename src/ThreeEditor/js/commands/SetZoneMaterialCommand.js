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
		this.name = `Zone applied simulation material: ${newMaterialName}`;

		this.object = object;

		this.oldMaterialName = this.editor.getObjectMaterial(object).name;
		this.newMaterialName = newMaterialName;
	}

	execute() {
		const simulationMaterial = this.editor.materialsManager.materials[this.newMaterialName];
		this.object.simulationMaterial = simulationMaterial;
		this.editor.signals.materialChanged.dispatch(simulationMaterial);
		this.editor.signals.objectChanged.dispatch(this.object);
	}

	undo() {
		const simulationMaterial = this.editor.materialsManager.materials[this.oldMaterialName];
		this.object.simulationMaterial = simulationMaterial;
		this.editor.signals.materialChanged.dispatch(simulationMaterial);
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
