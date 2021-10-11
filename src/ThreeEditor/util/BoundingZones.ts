
import * as THREE from 'three';
import { Vector3 } from 'three';

import { Editor } from '../js/Editor';
import { Vector } from '../js/libs/csg/csg-lib';
import { BoundingZone, BoundingZoneJSON } from './BoundingZone';


export interface BoundingZonesJSON {
    vacuum: BoundingZoneJSON;
}



export class BoundingZones extends THREE.Scene {
    editor: Editor;
    // blackHole: BoundingZone;
    vacuum: BoundingZone;

    constructor(editor: Editor, vacuum?: BoundingZone) {
        super();
        this.type = 'BoundingZones' as any;
        this.name = 'BoundingZones';
        this.editor = editor;

        // this.blackHole = new BoundingZone(this.editor);
        // this.blackHole.name = 'BlackHoleZone';
        // this.add(this.blackHole);

        if (vacuum) {
            this.vacuum = vacuum
        } else {
            this.vacuum = new BoundingZone(this.editor);
            this.vacuum.name = 'VacuumZone';
        }

        this.add(this.vacuum);

    }


    calculate() {
        this.vacuum.setFromObject(this.editor.scene);
    }

    toJSON() {

        let jsonObject: BoundingZonesJSON = {
            vacuum: this.vacuum.toJSON()
        };

        return jsonObject;
    }

    static fromJSON(editor: Editor, data: BoundingZonesJSON) {
        let vacuum = BoundingZone.fromJSON(editor, data.vacuum);

        let manager = new BoundingZones(editor, vacuum);

        return manager;

    }


    clone(recursive: boolean) {
        return new BoundingZones(this.editor).copy(this, recursive) as this;
    }

}
export const isBoundingZones = (x: any): x is BoundingZones => x instanceof BoundingZones;
