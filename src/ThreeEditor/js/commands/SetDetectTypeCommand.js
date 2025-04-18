import { Command } from '../Command';

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
		this.oldType = object.detectorType;
		this.newType = newType;
	}

	execute() {
		this.object.detectorType = this.newType;
		this.editor.signals.geometryChanged.dispatch(this.object);
		this.editor.signals.detectTypeChanged.dispatch(this.object);
		this.editor.signals.detectGeometryChanged.dispatch(this.object);
		this.editor.signals.objectChanged.dispatch(this.object, 'detectorType');
		this.editor.signals.sceneGraphChanged.dispatch(this.object);
	}

	undo() {
		this.object.detectorType = this.oldType;

		this.editor.signals.geometryChanged.dispatch(this.object);
		this.editor.signals.detectTypeChanged.dispatch(this.object);
		this.editor.signals.detectGeometryChanged.dispatch(this.object);
		this.editor.signals.objectChanged.dispatch(this.object, 'detectorType');
		this.editor.signals.sceneGraphChanged.dispatch(this.object);
	}

	update(cmd) {
		this.newType = cmd.newType;
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.oldType = this.oldType;
		output.newType = this.newType;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);

		this.oldType = json.oldType;
		this.newType = json.newType;
	}
}
