import { Command } from '../Command.js';

class RemoveZoneOperationTupleCommand extends Command {
	/**
	 * @typedef {import('../Editor.js').YaptideEditor} Editor
	 * @typedef {import('../../Simulation/Zones/BooleanZone.js').BooleanZone} CSGZone
	 * @typedef {import('../../CSG/CSGOperationTuple.js').OperationTuple} OperationTuple
	 * @param {Editor} editor
	 * @param {CSGZone} object
	 * @param {number} index
	 * @constructor
	 */
	constructor(editor, object, index) {
		super(editor);

		this.type = 'AddZoneOperationTupleCommand';
		this.name = `Zone pushed new operation list`;

		this.object = object;

		this.index = index;

		this.oldOperations = [];
	}

	execute() {
		this.oldOperations = this.object.unionOperations[this.index];
		this.object.removeUnion(this.index);
		this.editor.signals.objectChanged.dispatch(this.object, 'unionOperations');
		this.object.updateGeometry();
	}

	undo() {
		this.object.addUnion(this.index, this.oldOperations);
		this.editor.signals.objectChanged.dispatch(this.object, 'unionOperations');
		this.object.updateGeometry();
	}

	toJSON() {
		const output = super.toJSON(this);

		output.objectUuid = this.object.uuid;

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
	}
}

export { RemoveZoneOperationTupleCommand };
