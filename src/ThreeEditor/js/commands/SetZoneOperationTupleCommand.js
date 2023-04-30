import { Command } from '../Command.js';

class SetZoneOperationTupleCommand extends Command {
	/**
	 * @typedef {import('../Editor.js').Editor} Editor
	 * @typedef {import('../../util/CSG/CSGZone.js').Zone} CSGZone
	 * @typedef {import('../../util/CSG/CSGOperationTuple.js').OperationTuple} OperationTuple
	 * @param {Editor} editor
	 * @param {CSGZone} object
	 * @param {OperationTuple[]} operationTuple
	 * @param {number} index
	 * @constructor
	 */
	constructor(editor, object, operationTuple, index) {
		super(editor);

		this.type = 'SetZoneOperationTupleCommand';
		this.name = `Zone applied operations on index:[${index}]: ${operationTuple.map(el =>
			el.toRawData()
		)}`;

		this.object = object;
		this.oldOperations = [...object.unionOperations[index]];
		this.newOperations = [...operationTuple];
		this.index = index;
	}

	execute() {
		this.object.updateUnion(this.index, this.newOperations);
		this.editor.signals.objectChanged.dispatch(this.object, 'unionOperations');
		this.object.updateGeometry();
	}

	undo() {
		this.object.updateUnion(this.index, this.oldOperations);
		this.editor.signals.objectChanged.dispatch(this.object, 'unionOperations');
		this.object.updateGeometry();
	}

	toJSON() {
		const output = super.toJSON(this);

		output.objectUuid = this.object.uuid;
		output.oldOperations = this.oldOperations;
		output.newOperations = this.newOperations;

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldOperations = json.oldOperations;
		this.newOperations = json.newOperations;
	}
}

export { SetZoneOperationTupleCommand };
