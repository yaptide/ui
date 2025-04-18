import { ObjectLoader } from 'three';

import { Command } from '../Command';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newGeometry THREE.Geometry
 * @constructor
 */

class SetGeometryCommand extends Command {
	constructor(editor, object, newGeometry) {
		super(editor);

		this.type = 'SetGeometryCommand';
		this.name = 'Set Geometry';
		this.updatable = true;

		this.object = object;
		this.oldGeometry = object !== undefined ? object.geometry : undefined;
		this.newGeometry = newGeometry;
	}

	execute() {
		this.object.geometry.dispose();
		this.object.geometry = this.newGeometry;
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch(this.object);
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.objectChanged.dispatch(this.object, 'geometry');
	}

	undo() {
		this.object.geometry.dispose();
		this.object.geometry = this.oldGeometry;
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch(this.object);
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.objectChanged.dispatch(this.object, 'geometry');
	}

	update(cmd) {
		this.newGeometry = cmd.newGeometry;
	}

	toSerialized() {
		const output = super.toSerialized(this);

		output.objectUuid = this.object.uuid;
		output.oldGeometry = this.object.geometry.toSerialized();
		output.newGeometry = this.newGeometry.toSerialized();

		return output;
	}

	fromSerialized(json) {
		super.fromSerialized(json);

		this.object = this.editor.objectByUuid(json.objectUuid);

		this.oldGeometry = parseGeometry(json.oldGeometry);
		this.newGeometry = parseGeometry(json.newGeometry);

		function parseGeometry(data) {
			const loader = new ObjectLoader();

			return loader.parseGeometries([data])[data.uuid];
		}
	}
}

export { SetGeometryCommand };
