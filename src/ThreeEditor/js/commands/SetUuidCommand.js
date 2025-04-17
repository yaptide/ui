import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newUuid string
 * @constructor
 */
class SetUuidCommand extends Command {
	constructor(editor, object, newUuid) {
		super(editor);

		this.type = 'SetUuidCommand';
		this.name = 'Update UUID';

		this.object = object;

		this.oldUuid = object !== undefined ? object.uuid : undefined;
		this.newUuid = newUuid;
	}

	execute() {
		this.object.uuid = this.newUuid;
		this.editor.signals.objectChanged.dispatch(this.object);
		this.editor.signals.sceneGraphChanged.dispatch();
	}

	undo() {
		this.object.uuid = this.oldUuid;
		this.editor.signals.objectChanged.dispatch(this.object);
		this.editor.signals.sceneGraphChanged.dispatch();
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.oldUuid = this.oldUuid;
		output.newUuid = this.newUuid;

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.oldUuid = json.oldUuid;
		this.newUuid = json.newUuid;
		this.object = this.editor.objectByUuid(json.oldUuid);

		if (this.object === undefined) {
			this.object = this.editor.objectByUuid(json.newUuid);
		}
	}
}

export { SetUuidCommand };
