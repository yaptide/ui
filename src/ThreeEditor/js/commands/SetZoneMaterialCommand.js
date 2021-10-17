import { Command } from '../Command.js';
import { ObjectLoader } from 'three';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newMaterialName String
 * @constructor
 */
class SetZoneMaterialCommand extends Command {

	constructor( editor, object, newMaterialName ) {

		super( editor );

		this.type = 'SetZoneMaterialCommand';
		this.name = 'New Material';

		this.object = object;

		this.oldMaterialName = this.editor.getObjectMaterial( object ).name;
		this.newMaterialName = newMaterialName;

	}

	execute() {

        let material = this.editor.simulationMaterials[this.newMaterialName] 
                    ?? Object.entries(this.editor.simulationMaterials)[0][1];

		this.editor.setObjectMaterial( this.object, 0, material );
		this.editor.signals.materialChanged.dispatch( material );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo() {

        let material = this.editor.simulationMaterials[this.oldMaterialName] 
                    ?? Object.entries(this.editor.simulationMaterials)[0][1];

		this.editor.setObjectMaterial( this.object, 0, material );
		this.editor.signals.materialChanged.dispatch( material );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.oldMaterialName = this.oldMaterialName;
		output.newMaterialName = this.newMaterialName;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldMaterial = parseMaterial( json.oldMaterial );
		this.newMaterial = parseMaterial( json.newMaterial );

		function parseMaterial( json ) {

			const loader = new ObjectLoader();
			const images = loader.parseImages( json.images );
			const textures = loader.parseTextures( json.textures, images );
			const materials = loader.parseMaterials( [ json ], textures );
			return materials[ json.uuid ];

		}

	}

}

export { SetZoneMaterialCommand };
