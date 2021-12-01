import * as CSG from '../../util/CSG/CSG';
import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
export class AddZoneCommand extends Command {
	constructor(editor, zone) {
		super(editor);

		this.type = 'AddZoneCommand';

		this.zone = zone;
		this.object = zone;
		this.name = zone ? `Add Zone: ${zone.name}` : `Create Zone`;
	}

	execute() {
		if (this.zone) this.editor.zoneManager.addZone(this.zone);
		else this.zone = this.editor.zoneManager.createZone();

		this.editor.select(this.zone);
	}

	undo() {
		this.editor.zoneManager.removeZone(this.zone);
		this.editor.deselect();
	}

	toJSON() {
		const output = super.toJSON(this);

		output.zone = this.zone.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.zone = this.editor.objectByUuid(json.zone.object.uuid);

		if (this.zone === undefined) {
			this.zone = CSG.Zone.fromJSON(this.editor, json.object);
		}
	}
}
