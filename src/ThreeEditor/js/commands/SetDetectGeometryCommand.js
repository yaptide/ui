import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newData DETECT.Any
 * @constructor
 */

class SetDetectGeometryCommand extends Command {

    constructor(editor, object, newData) {

        super(editor);

        this.type = 'SetDetectGeometryCommand';
        this.name = 'Set DetectGeometry';
        this.updatable = true;

        this.object = object;
        this.oldData = object.getData();
        console.log(newData,this.oldData);
        this.newData = {};
        Object.entries(object.getData()).forEach(([key,_]) => {
            this.newData[key] = newData[key] || this.oldData[key];
        });
    }

    execute() {

        this.object.setData(this.newData)

        this.editor.signals.geometryChanged.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();

    }

    undo() {
        let tmp = this.object.getData();
        this.object.setData(this.oldData)
        this.newData = this.object.getData();
        this.oldData = tmp;

        this.editor.signals.geometryChanged.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();
    }

    update(cmd) {

        this.newGeometry = cmd.newGeometry;

    }

    toJSON() {

        const output = super.toJSON(this);

        output.objectUuid = this.object.uuid;
        output.oldData = this.oldData;
        output.newData = this.newData;

        return output;

    }

    fromJSON(json) {

        super.fromJSON(json);

        this.object = this.editor.objectByUuid(json.objectUuid);

        this.oldData = json.oldData;
        this.newData = json.newData;

    }

}

export { SetDetectGeometryCommand };
