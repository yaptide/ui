import { Command } from '../Command.js';
import { ObjectLoader } from 'three';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
class AddDetectSectionCommand extends Command {

	constructor( editor, section ) {

		super( editor );

		this.type = 'AddDetectGeometryCommand';

		this.section = section;
		this.name = section
			? `Add Section: ${section.name}`
			: `Create Section`;

	}

	execute() {

		if(this.section) this.editor.detectManager.addSection( this.section );
		else this.section = this.editor.detectManager.createSection();

		this.editor.select( this.section );

	}

	undo() {

		this.editor.removeObject( this.section );
		this.editor.deselect();

	}

	toJSON() {

		let output = super.toJSON( this );

		output.object = this.section.toJSON();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.section = this.editor.objectByUuid( json.object.object.uuid );

		if ( this.section === undefined ) {

			const loader = new ObjectLoader();
			this.section = loader.parse( json.object );

		}

	}

}

export { AddDetectSectionCommand };
