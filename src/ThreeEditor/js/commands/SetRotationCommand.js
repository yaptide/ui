import { Euler } from 'three';

import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newRotation THREE.Euler
 * @param optionalOldRotation THREE.Euler
 * @constructor
 */
class SetRotationCommand extends Command {
	constructor(editor, object, newRotation, optionalOldRotation) {
		super(editor);

		this.type = 'SetRotationCommand';
		this.name = 'Set Rotation';
		this.updatable = true;

		this.object = object;

		this.oldUserSetRotation = object.userData['userSetRotation'];

		if (object !== undefined && newRotation !== undefined) {
			this.oldRotation = object.rotation.clone();
			this.newRotation = newRotation.clone();
		}

		if (optionalOldRotation !== undefined) {
			this.oldRotation = optionalOldRotation.clone();
		}
	}

	execute() {
		this.object.rotation.copy(this.newRotation);
		delete this.object.userData['userSetRotation'];
		this.object.updateMatrixWorld(true);
		this.editor.signals.objectChanged.dispatch(this.object, 'rotation');
	}

	undo() {
		this.object.rotation.copy(this.oldRotation);
		this.object.userData['userSetRotation'] = this.oldUserSetRotation;
		this.object.updateMatrixWorld(true);
		this.editor.signals.objectChanged.dispatch(this.object, 'rotation');
	}

	update(command) {
		this.newRotation.copy(command.newRotation);
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.oldRotation = this.oldRotation.toArray();
		output.newRotation = this.newRotation.toArray();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);
		this.oldRotation = new Euler().fromArray(json.oldRotation);
		this.newRotation = new Euler().fromArray(json.newRotation);
	}
}

export { SetRotationCommand };
