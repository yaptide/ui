import { Command } from '../Command';

class AddZoneOperationTupleCommand extends Command {
	/**
	 * @typedef {import('../YaptideEditor.js').YaptideEditor} Editor
	 * @typedef {import('../../Simulation/Zones/BooleanZone.js').BooleanZone} CSGZone
	 * @typedef {import('../../CSG/CSGOperationTuple.js').OperationTuple} OperationTuple
	 * @param {Editor} editor
	 * @param {CSGZone} object
	 * @constructor
	 */
	constructor(editor, object) {
		super(editor);

		this.type = 'AddZoneOperationTupleCommand';
		this.name = `Zone pushed new operation list`;

		this.object = object;
	}

	execute() {
		this.object.addUnion();
		this.editor.signals.objectChanged.dispatch(this.object, 'unionOperations');
		this.object.updateGeometry();
	}

	undo() {
		this.object.removeUnion();
		this.editor.signals.objectChanged.dispatch(this.object, 'unionOperations');
		this.object.updateGeometry();
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
	}
}

export { AddZoneOperationTupleCommand };
