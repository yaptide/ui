import { Command } from '../Command.js';

import { CSGZone } from '../../util/CSG/CSGZone';

/**
 * @param editor Editor
 * @param zone CSGZone
 * @constructor
 */
class RemoveZoneCommand extends Command {

	constructor( editor, zone ) {

		super( editor );

		this.type = 'RemoveZoneCommand';
		this.name = 'Remove Zone';

		this.zone = zone;		

	}

	execute() {

		this.editor.zonesManager.remove( this.zone );
		this.editor.deselect();

	}

	undo() {

		this.editor.zonesManager.add( this.zone );
		this.editor.select( this.zone );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.zone = this.zone.toJSON();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.zone = this.editor.objectByUuid( json.object.zone.uuid );

		if ( this.zone === undefined ) {
			
			this.zone = CSGZone.fromJSON( this.editor, json.object );

		}

	}

}

export { RemoveZoneCommand };
