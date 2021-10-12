
import * as THREE from 'three';
import { Vector3 } from 'three';

import { Editor } from '../js/Editor';


export interface BoundingZoneJSON {
    type: string;
    center: THREE.Vector3;
    size: THREE.Vector3;
    geometryType: BoundingZoneType;
    name: string;
    color: THREE.ColorRepresentation;
    marginMultiplier: number;
}

const BOUNDING_ZONE_TYPE = ['sphere', 'cylinder', 'box'] as const;

export type BoundingZoneType = (typeof BOUNDING_ZONE_TYPE)[number];

export class BoundingZone extends THREE.Object3D {
    editor: Editor;
    geometryType: BoundingZoneType = 'box';
    helper: THREE.Box3Helper;
    box: THREE.Box3;
    color: THREE.Color;
    marginMultiplier: number;

    constructor(editor: Editor, { box, color = 0xff0000, marginMultiplier = 1.1 }: { box?: THREE.Box3, color?: THREE.ColorRepresentation, marginMultiplier?: number } = {}) {
        super();
        this.type = 'BoundingZone' as any;
        this.name = 'BoundingZone';
        this.editor = editor;

        this.color = new THREE.Color(color);
        this.marginMultiplier = marginMultiplier;

        this.box = box ?? new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.helper = new THREE.Box3Helper(this.box, this.color);

        editor.sceneHelpers.add(this.helper);

    }

    setFromObject(object: THREE.Object3D) {
        this.updateBox((box) => {
            box.setFromObject(object);
            this.makeCubeFromBox();
            this.addSafetyMarginToBox();
        });
    }

    setFromCenterAndSize(center: THREE.Vector3, size: THREE.Vector3) {
        this.updateBox((box) => box.setFromCenterAndSize(center, size));
    }

    updateBox(updateFunction: (box: THREE.Box3) => void) {
        this.editor.sceneHelpers.remove(this.helper);


        updateFunction(this.box);

        this.helper = new THREE.Box3Helper(this.box, this.color);
        this.editor.sceneHelpers.add(this.helper);
        this.editor.signals.objectChanged.dispatch(this);
    }

    makeCubeFromBox() {
        let size = this.box.getSize(new Vector3());
        let maxSize = Math.max(size.x, size.y, size.z);

        size.setScalar(maxSize);

        this.box.setFromCenterAndSize(this.box.getCenter(new Vector3()), size);
    }

    addSafetyMarginToBox() {
        let size = this.box.getSize(new Vector3());

        size.multiplyScalar(this.marginMultiplier);

        this.box.setFromCenterAndSize(this.box.getCenter(new Vector3()), size);
    }

    reset() {
        this.color = new THREE.Color(0xff0000);
        this.name = 'BoundingZone';
        this.updateBox((box) => box.setFromCenterAndSize(new Vector3(), new Vector3()));
    }

    toJSON() {

        let jsonObject: BoundingZoneJSON = {
            center: this.box.getCenter(new Vector3()),
            size: this.box.getSize(new Vector3()),
            type: this.type,
            geometryType: this.geometryType,
            name: this.name,
            color: this.color.getHex(),
            marginMultiplier: this.marginMultiplier,
        };

        return jsonObject;
    }

    static fromJSON(editor: Editor, data: BoundingZoneJSON) {
        let box = new THREE.Box3();
        box.setFromCenterAndSize(data.center, data.size);

        let object = new BoundingZone(editor, { box, ...data });

        object.geometryType = data.geometryType;
        object.name = data.name;

        return object;

    }


    clone(recursive: boolean) {
        return new BoundingZone(this.editor).copy(this, recursive) as this;
    }



}
export const isBoundingZone = (x: any): x is BoundingZone => x instanceof BoundingZone;
