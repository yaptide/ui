import { Command } from '../Command.js';
import { ObjectLoader } from 'three';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newData DETECT.DETECT_TYPE
 * @constructor
 */

export class SetDetectTypeCommand extends Command {

    constructor(editor, object, newType) {

        super(editor);

        this.type = 'SetDetectTypeCommand';
        this.name = 'Set DetectType';
        this.updatable = true;

        this.object = object;
        this.oldType = object.detectGeometryType;
        this.newType = newType;
    }

    execute() {

        this.object.detectGeometryType = this.newType;

        this.editor.signals.geometryChanged.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();

    }

    undo() {
        let tmp = this.object.detectGeometryType;
        this.object.detectGeometryType = this.oldType;
        this.newType = this.oldType;
        this.oldType = tmp;

        this.editor.signals.geometryChanged.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();
    }

    update(cmd) {

        this.newGeometry = cmd.newGeometry;

    }

    toJSON() {

        const output = super.toJSON(this);

        output.objectUuid = this.object.uuid;
        output.oldType = this.oldType;
        output.newType = this.newType;

        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);

        this.object = this.editor.objectByUuid(json.objectUuid);

        this.oldType = json.oldType;
        this.newType = json.newType;

    }

}
