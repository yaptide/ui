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

		this.zone = this.editor.zonesManager.createZone();
		this.editor.select( this.zone );

	}

	undo() {

		this.editor.removeObject( this.zone );
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

		if ( this.object === undefined ) {
			throw new Error(`Can't load zone`)
		}

	}

}

export { AddZoneCommand };

