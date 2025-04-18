import { BooleanZone } from '../../Simulation/Zones/BooleanZone';
import { Command } from '../Command';

/**
 * @typedef {import('../YaptideEditor.js').YaptideEditor} Editor
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

	toSerialized() {
		const output = super.toSerialized(this);

		output.object = this.object.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object =
			this.editor.zoneManager.getZoneByUuid(json.object.uuid) ??
			BooleanZone.fromSerialized(this.editor, json.object);
	}
}

export { RemoveZoneCommand };
