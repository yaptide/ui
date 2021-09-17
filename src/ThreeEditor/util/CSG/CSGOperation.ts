import { Editor } from "../../js/Editor";
import CSG from "../../js/libs/csg/three-csg";
import { executeOperation, isOperation, Operation } from "../Operation";

export interface CSGOperationJSON {
    objectUuid: string;
    mode: Operation;
}

export class CSGOperation {
    object: THREE.Object3D;
    mode: Operation;

    constructor(object: THREE.Object3D, mode: Operation) {
        this.object = object;
        this.mode = mode;
    }

    execute(object: CSG) {
        return (executeOperation(this.mode))(object);
    }

    toJSON() {
        let jsonObject: CSGOperationJSON = {
            mode: this.mode,
            objectUuid: this.object.uuid
        };
        return jsonObject;
    }

    static fromJSON(editor: Editor, data: CSGOperationJSON) {
        let object = editor.scene.getObjectByProperty('uuid', data.objectUuid);

        if (!object)
            throw new Error('Can not found object on scene: (uuid)' + data.objectUuid);

        if (!isOperation(data.mode))
            throw new Error('Mode contains not known operation: ' + data.mode);

        return new CSGOperation(object, data.mode);
    }

}