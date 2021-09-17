import { Signal } from 'signals';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { Editor } from '../../js/Editor';
import CSG from '../../js/libs/csg/three-csg';
import { debounce } from 'throttle-debounce';
import * as Comlink from 'comlink';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./CSGWorker';
import { ICSGWorker } from './CSGWorker';
import { CSGZone, CSGZoneJSON } from './CSGZone';


interface CSGManagerJSON {
    zones: CSGZoneJSON[]
}

export class CSGManager {
    editor: Editor;
    zones: Map<String, CSGZone> = new Map();
    worker = Comlink.wrap<ICSGWorker>(new Worker());

    private signals: {
        CSGManagerStateChanged: Signal,
    };

    constructor(editor: Editor) {
        this.editor = editor;
        this.signals = editor.signals;
    }

    createZone() {
        let zone = new CSGZone(this.editor);

        this.addZone(zone);

        this.signals.CSGManagerStateChanged.dispatch();

        return zone;
    }

    removeZone(zone: CSGZone) {
        this.editor.zones.remove(zone);
        zone.remove();
        this.zones.delete(zone.uuid);

        this.signals.CSGManagerStateChanged.dispatch();
    }

    addZone(zone: CSGZone) {
        zone.worker = this.worker;
        this.editor.zones.add(zone);
        this.zones.set(zone.uuid, zone);

        this.signals.CSGManagerStateChanged.dispatch();
    }

    toJSON() {
        let zones = Array.from(this.zones.values()).map((zone) => zone.toJSON());

        let jsonObject: CSGManagerJSON = {
            zones
        };

        return jsonObject;
    }

    static fromJSON(editor: Editor, data: CSGManagerJSON) {

        let manager = new CSGManager(editor);

        if (!data)
            console.warn('Passed empty data to load CSGManager', data)
        else
            data.zones.forEach((zone) => {

                manager.addZone(CSGZone.fromJSON(editor, zone));

            });

        return manager;

    }

}
