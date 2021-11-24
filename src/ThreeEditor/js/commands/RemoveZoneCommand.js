import { Command } from '../Command.js';

import * as CSG from '../../util/CSG/CSG';

/**
 * @param editor Editor
 * @param zone CSG.Zone
 * @constructor
 */
class RemoveZoneCommand extends Command {
	constructor(editor, zone) {
		super(editor);

		this.type = 'RemoveZoneCommand';
		this.name = 'Remove Zone';

		this.zone = zone;
	}

	execute() {
		this.editor.zoneManager.removeZone(this.zone);
		this.editor.deselect();
	}

	undo() {
		this.editor.zoneManager.addZone(this.zone);
		this.editor.select(this.zone);
	}

	toJSON() {
		const output = super.toJSON(this);

		output.zone = this.zone.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.zone = this.editor.objectByUuid(json.object.zone.uuid);

		if (this.zone === undefined) {
			this.zone = CSG.Zone.fromJSON(this.editor, json.object);
		}
	}
}

export { RemoveZoneCommand };
