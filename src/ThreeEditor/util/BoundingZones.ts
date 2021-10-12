
import * as THREE from 'three';

import { Editor } from '../js/Editor';
import { BoundingZone, BoundingZoneJSON } from './BoundingZone';


export interface BoundingZonesJSON {
    vacuum: BoundingZoneJSON;
    blackHole: BoundingZoneJSON;
}



export class BoundingZones extends THREE.Scene {
    editor: Editor;
    blackHole: BoundingZone;
    vacuum: BoundingZone;

    constructor(editor: Editor, { vacuum, blackHole }: { vacuum?: BoundingZone, blackHole?: BoundingZone } = {}) {
        super();
        this.type = 'BoundingZones' as any;
        this.name = 'BoundingZones';
        this.editor = editor;

        if (blackHole) {
            this.blackHole = blackHole
        } else {
            this.blackHole = new BoundingZone(this.editor);
            this.blackHole.name = 'BlackHoleZone';
            this.blackHole.marginMultiplier = 1.2;
        }
        this.add(this.blackHole);

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
        this.blackHole.setFromObject(this.editor.scene);
    }

    toJSON() {

        let jsonObject: BoundingZonesJSON = {
            vacuum: this.vacuum.toJSON(),
            blackHole: this.blackHole.toJSON(),
        };

        return jsonObject;
    }

    static fromJSON(editor: Editor, data: BoundingZonesJSON) {
        let vacuum = BoundingZone.fromJSON(editor, data.vacuum);
        let blackHole = BoundingZone.fromJSON(editor, data.blackHole);

        let manager = new BoundingZones(editor, { vacuum, blackHole });

        return manager;

    }

    reset() {
        this.blackHole.reset();
        this.blackHole.name = 'BlackHoleZone';
        this.blackHole.marginMultiplier = 1.2;

        this.vacuum.reset();
        this.vacuum.name = 'VacuumZone';
    }


    clone(recursive: boolean) {
        return new BoundingZones(this.editor).copy(this, recursive) as this;
    }

}
export const isBoundingZones = (x: any): x is BoundingZones => x instanceof BoundingZones;
