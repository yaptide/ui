import { YaptideEditor } from '../js/Editor';
import CSG from '../js/libs/csg/three-csg';
import { executeOperation, isOperation, Operation } from '../../types/Operation';
import THREE from 'three';

export interface OperationTupleJSON {
	objectUuid: string;
	mode: Operation;
}

export class OperationTuple {
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

	toJSON() {
		const jsonObject: OperationTupleJSON = {
			mode: this.mode,
			objectUuid: this.object.uuid
		};
		return jsonObject;
	}

	static fromJSON(editor: YaptideEditor, data: OperationTupleJSON) {
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
