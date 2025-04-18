import { ObjectLoader } from 'three';

import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newMaterial THREE.Material
 * @constructor
 */
class SetMaterialCommand extends Command {
	constructor(editor, object, newMaterial, materialSlot) {
		super(editor);

		this.type = 'SetMaterialCommand';
		this.name = 'New Material';

		this.object = object;
		this.materialSlot = materialSlot;

		this.oldMaterial = this.editor.getObjectMaterial(object, materialSlot);
		this.newMaterial = newMaterial;
	}

	execute() {
		this.editor.setObjectMaterial(this.object, this.materialSlot, this.newMaterial);
		this.editor.signals.materialChanged.dispatch(this.newMaterial);
		this.editor.signals.objectChanged.dispatch(this.object);
	}

	undo() {
		this.editor.setObjectMaterial(this.object, this.materialSlot, this.oldMaterial);
		this.editor.signals.materialChanged.dispatch(this.oldMaterial);
		this.editor.signals.objectChanged.dispatch(this.object);
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.oldMaterial = this.oldMaterial.toSerialized();
		output.newMaterial = this.newMaterial.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldMaterial = parseMaterial(json.oldMaterial);
		this.newMaterial = parseMaterial(json.newMaterial);

		function parseMaterial(materialJson) {
			const loader = new ObjectLoader();
			const images = loader.parseImages(materialJson.images);
			const textures = loader.parseTextures(materialJson.textures, images);
			const materials = loader.parseMaterials([materialJson], textures);

			return materials[materialJson.uuid];
		}
	}
}

export { SetMaterialCommand };
