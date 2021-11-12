import { Command } from '../Command.js';

import { Zone } from '../../util/CSG/CSGZone';

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

		this.editor.zonesManager.removeZone( this.zone );
		this.editor.deselect();

	}

	undo() {

		this.editor.zonesManager.addZone( this.zone );
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
			
			this.zone = Zone.fromJSON( this.editor, json.object );

		}

	}

}

export { RemoveZoneCommand };
