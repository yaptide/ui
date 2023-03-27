import { Command } from '../Command.js';


class AddZoneOperationTupleCommand extends Command {
    /**
    * @typedef {import('../Editor.js').Editor} Editor
    * @typedef {import('../../util/CSG/CSGZone.js').Zone} CSGZone
    * @typedef {import('../../util/CSG/CSGOperationTuple.js').OperationTuple} OperationTuple
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

export { AddZoneOperationTupleCommand };
