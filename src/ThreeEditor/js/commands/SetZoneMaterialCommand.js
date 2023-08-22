import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newMaterialName String
 * @constructor
 */
class SetZoneMaterialCommand extends Command {
	constructor(editor, object, newIcru) {
		super(editor);

		this.type = 'SetZoneMaterialCommand';
		this.name = `Zone applied simulation material: ${newIcru}`;

		this.object = object;

		this.oldIcru = object.simulationMaterial.icru;
		this.newIcru = newIcru;
	}

	execute() {
		const simulationMaterial = this.editor.materialManager.materials[this.newIcru];
		this.object.simulationMaterial = simulationMaterial;
		this.editor.signals.materialChanged.dispatch(simulationMaterial);
		this.editor.signals.objectChanged.dispatch(this.object, 'simulationMaterial');
	}

	undo() {
		const simulationMaterial = this.editor.materialManager.materials[this.oldIcru];
		this.object.simulationMaterial = simulationMaterial;
		this.editor.signals.materialChanged.dispatch(simulationMaterial);
		this.editor.signals.objectChanged.dispatch(this.object, 'simulationMaterial');
	}

	toJSON() {
		const output = super.toJSON(this);

		output.objectUuid = this.object.uuid;
		output.oldIcru = this.oldIcru;
		output.newIcru = this.newIcru;

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldIcru = json.oldIcru;
		this.newIcru = json.newIcru;
	}
}

export { SetZoneMaterialCommand };
