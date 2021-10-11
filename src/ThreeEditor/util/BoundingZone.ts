
import * as THREE from 'three';
import { Vector3 } from 'three';

import { Editor } from '../js/Editor';


export interface BoundingZoneJSON {
    center: THREE.Vector3;
    size: THREE.Vector3;
    type: BoundingZoneType;
}

const BOUNDING_ZONE_TYPE = ['sphere', 'cylinder', 'box'] as const;

export type BoundingZoneType = (typeof BOUNDING_ZONE_TYPE)[number];

export class BoundingZone extends THREE.Object3D {
    editor: Editor;
    type: BoundingZoneType = 'box';
    helper: THREE.Box3Helper;
    box: THREE.Box3;

    constructor(editor: Editor, box?: THREE.Box3) {
        super();
        this.type = 'BoundingZone' as any;
        this.name = 'BoundingZone';
        this.editor = editor;

        this.box = box ?? new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.helper = new THREE.Box3Helper(this.box, new THREE.Color(0xff0000));

        editor.sceneHelpers.add(this.helper);

    }

    setFromObject(object: THREE.Object3D) {
        this.editor.sceneHelpers.remove(this.helper);
        this.box.setFromObject(object);

        this.makeCubeFromBox();

        this.helper = new THREE.Box3Helper(this.box, new THREE.Color(0xff0000));
        this.editor.sceneHelpers.add(this.helper);
        this.editor.signals.objectChanged.dispatch(this);
    }

    makeCubeFromBox() {
        let size = this.box.getSize(new Vector3());
        let maxSize = Math.max(size.x, size.y, size.z);
        size.setScalar(maxSize);
        this.box.setFromCenterAndSize(this.box.getCenter(new Vector3()), size);
    }

    toJSON() {

        let jsonObject: BoundingZoneJSON = {
            center: this.box.getCenter(new Vector3()),
            size: this.box.getSize(new Vector3()),
            type: this.type
        };

        return jsonObject;
    }

    static fromJSON(editor: Editor, data: BoundingZoneJSON) {
        let box = new THREE.Box3();
        box.setFromCenterAndSize(data.center, data.size);

        let object = new BoundingZone(editor, box);

        object.type = data.type;

        return object;

    }


    clone(recursive: boolean) {
        return new BoundingZone(this.editor).copy(this, recursive) as this;
    }



}
export const isBoundingZone = (x: any): x is BoundingZone => x instanceof BoundingZone;
