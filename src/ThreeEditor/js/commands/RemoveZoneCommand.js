import { Command } from '../Command.js';
import { BooleanZone } from '../../Simulation/Zones/BooleanZone';

/**
 * @typedef {import('../Editor.js').Editor} Editor
 */
class RemoveZoneCommand extends Command {
	/**
	 * @param {Editor} editor
	 * @param {BooleanZone} object
	 * @constructor
	 */
	constructor(editor, object) {
		super(editor);

		this.type = 'RemoveZoneCommand';
		this.name = 'Remove Zone';

		this.object = object;
	}

	execute() {
		this.editor.zoneManager.removeZone(this.object);
		this.editor.deselect();
	}

	undo() {
		this.editor.zoneManager.addZone(this.object);
		this.editor.select(this.object);
	}

	toJSON() {
		const output = super.toJSON(this);

		output.object = this.object.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object =
			this.editor.zoneManager.getZoneByUuid(json.object.uuid) ??
			BooleanZone.fromJSON(this.editor, json.object);
	}
}

export { RemoveZoneCommand };
