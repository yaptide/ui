import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object DetectSection
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
        this.newData = {};
        Object.entries(object.getData()).forEach(([key, _]) => {
            this.newData[key] = newData[key] ?? this.oldData[key];
        });
    }

    execute() {

        this.object.setData(this.newData)

        this.editor.signals.geometryChanged.dispatch(this.object);
        this.editor.signals.detectGeometryChanged.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();

    }

    undo() {
        const tmp = this.object.getData();
        this.object.setData(this.oldData)
        this.newData = this.object.getData();
        this.oldData = tmp;

        this.editor.signals.geometryChanged.dispatch(this.object);
        this.editor.signals.detectGeometryChanged.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();
    }

    update(command) {

        this.newData = command.newData;

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
