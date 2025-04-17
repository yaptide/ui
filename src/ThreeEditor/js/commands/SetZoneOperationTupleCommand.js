import { Command } from '../Command';

/**
 *
 * @typedef {import('../YaptideEditor.js').YaptideEditor} Editor
 * @typedef {import('../../Simulation/Zones/BooleanZone').BooleanZone} BooleanZone
 * @typedef {import('../../CSG/CSGOperationTuple.js').OperationTuple} OperationTuple
 */
class SetZoneOperationTupleCommand extends Command {
	/**
	 * @param {Editor} editor
	 * @param {BooleanZone} object
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

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.oldOperations = this.oldOperations;
		output.newOperations = this.newOperations;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldOperations = json.oldOperations;
		this.newOperations = json.newOperations;
	}
}

export { SetZoneOperationTupleCommand };
