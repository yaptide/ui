import { Serializable } from 'node:child_process';

import * as THREE from 'three';

import { executeOperation, isOperation, Operation } from '../../types/Operation';
import { SerializableState } from '../js/EditorJson';
import CSG from '../js/libs/csg/three-csg';
import { YaptideEditor } from '../js/YaptideEditor';

export interface OperationTupleJSON {
	objectUuid: string;
	mode: Operation;
}

export class OperationTuple implements SerializableState<OperationTupleJSON> {
	object: THREE.Mesh;
	mode: Operation;
	readonly isOperationTuple: true = true;

	constructor(object: THREE.Mesh, mode: Operation) {
		this.object = object;
		this.mode = mode;
	}

	execute(csg: CSG) {
		const { object } = this;
		object.updateMatrix();

		return executeOperation(this.mode)(csg)(CSG.fromMesh(object));
	}

	toSerialized() {
		const jsonObject: OperationTupleJSON = {
			mode: this.mode,
			objectUuid: this.object.uuid
		};

		return jsonObject;
	}

	fromSerialized(state: OperationTupleJSON) {
		return this;
	}

	static fromSerialized(editor: YaptideEditor, data: OperationTupleJSON) {
		const { mode, objectUuid } = data;
		const object = editor.figureManager.getObjectByProperty('uuid', objectUuid);

		if (!object) throw new Error('Can not found object on scene: (uuid)' + objectUuid);

		if (!isOperation(mode)) throw new Error('Mode contains not known operation: ' + mode);

		return new OperationTuple(object as THREE.Mesh, mode);
	}

	toRawData() {
		return { operation: this.mode, objectId: this.object.id };
	}
}

export const isOperationTuple = (x: unknown): x is OperationTuple => x instanceof OperationTuple;
