import { Editor } from "../../js/Editor";
import CSG from "../../js/libs/csg/three-csg";
import { executeOperation, isOperation, Operation } from "../Operation";
import THREE from 'three';

export interface OperationTupleJSON {
    objectUuid: string;
    mode: Operation;
}

export class OperationTuple {
    object: THREE.Object3D;
    mode: Operation;
    readonly isOperationTuple: true = true;
    

    constructor(object: THREE.Object3D, mode: Operation) {
        this.object = object;
        this.mode = mode;
    }

    execute(object: CSG) {
        return (executeOperation(this.mode))(object);
    }

    toJSON() {
        let jsonObject: OperationTupleJSON = {
            mode: this.mode,
            objectUuid: this.object.uuid
        };
        return jsonObject;
    }

    static fromJSON(editor: Editor, data: OperationTupleJSON) {
        let { mode, objectUuid } = data;
        let object = editor.scene.getObjectByProperty('uuid', objectUuid);

        if (!object)
            throw new Error('Can not found object on scene: (uuid)' + objectUuid);

        if (!isOperation(mode))
            throw new Error('Mode contains not known operation: ' + mode);

        return new OperationTuple(object, mode);
    }

}


export const isOperationTuple = (x: unknown): x is OperationTuple => x instanceof OperationTuple;
