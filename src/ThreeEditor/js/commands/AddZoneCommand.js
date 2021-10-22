import { CSGZone } from '../../util/CSG/CSGZone';
import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
class AddZoneCommand extends Command {

	constructor( editor ) {

		super( editor );

		this.type = 'AddZoneCommand';
		this.name = `Add new Zone`;

	}

	execute() {

		if( this.zone === undefined )
			this.zone = this.editor.zonesManager.createZone();
		else
			this.editor.zonesManager.addZone( this.zone );
		this.editor.select( this.zone );

	}

	undo() {

		this.editor.zonesManager.removeZone( this.zone );
		this.editor.deselect();

	}

	toJSON() {

		const output = super.toJSON(this);

		output.zone = this.zone.toJSON();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.zone = this.editor.objectByUuid( json.zone.object.uuid );

		if ( this.zone === undefined ) {
			
			this.zone = CSGZone.fromJSON( this.editor, json.object );

		}

	}

}

export { AddZoneCommand };

