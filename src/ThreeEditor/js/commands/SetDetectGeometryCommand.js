import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object DetectGeometry
 * @param newData DETECT.Any
 * @constructor
 */
export class SetDetectGeometryCommand extends Command {
	constructor(editor, object, newData) {
		super(editor);

		this.type = 'SetDetectGeometryCommand';
		this.name = 'Set DetectGeometry';
		this.updatable = true;
		this.object = object;
		this.oldData = object.getData();
		this.newData = newData;
	}

	execute() {
		this.object.setData(this.newData);
		this.editor.signals.geometryChanged.dispatch(this.object);
		this.editor.signals.detectGeometryChanged.dispatch(this.object);
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.objectChanged.dispatch(this.object, 'geometryData');
	}

	undo() {
		const tmp = this.object.getData();
		this.object.setData(this.oldData);
		this.newData = this.object.getData();
		this.oldData = tmp;

		this.editor.signals.geometryChanged.dispatch(this.object);
		this.editor.signals.detectGeometryChanged.dispatch(this.object);
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.objectChanged.dispatch(this.object, 'geometryData');
	}

	update(command) {
		this.newData = command.newData;
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.oldData = this.oldData;
		output.newData = this.newData;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);

		this.oldData = json.oldData;
		this.newData = json.newData;
	}
}
