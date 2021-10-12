import * as Comlink from 'comlink';
import * as THREE from 'three';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./CSGWorker';
import { Editor } from '../../js/Editor';
import { BoundingZones, BoundingZonesJSON } from '../BoundingZones';
import { ICSGWorker } from './CSGWorker';
import { CSGZone, CSGZoneJSON } from './CSGZone';


interface CSGManagerJSON {
    uuid: string,
    name: string,
    zones: CSGZoneJSON[],
    boundingZones: BoundingZonesJSON
}

export class CSGManager extends THREE.Scene {
    editor: Editor;
    worker: Comlink.Remote<ICSGWorker>;
    boundingZones: BoundingZones;

    constructor(editor: Editor) {
        super();
        this.type = 'ZonesManager' as any;
        this.name = "Zones";
        this.worker = Comlink.wrap<ICSGWorker>(new Worker());
        this.editor = editor;

        this.boundingZones = new BoundingZones(editor);

        this.editor.signals.zoneEmpty.add((zone: CSGZone) => this.handleZoneEmpty(zone));

    }

    createZone() {
        let zone = new CSGZone(this.editor);

        this.add(zone);

        return zone;
    }

    add(zone: CSGZone) {
        zone.worker = this.worker;

        super.add(zone);

        this.editor.signals.objectAdded.dispatch(zone);
        this.editor.signals.zoneAdded.dispatch(zone);
        this.editor.signals.sceneGraphChanged.dispatch();
        this.editor.signals.CSGManagerStateChanged.dispatch();

        return this;
    }

    remove(zone: CSGZone) {
        super.remove(zone);

        this.editor.signals.objectRemoved.dispatch(zone);
        this.editor.signals.zoneRemoved.dispatch(zone);
        this.editor.signals.sceneGraphChanged.dispatch();
        this.editor.signals.CSGManagerStateChanged.dispatch();

        return this;
    }

    toJSON() {
        let zones = this.children.map((zone) => zone.toJSON());
        let uuid = this.uuid;
        let name = this.name;
        let jsonObject: CSGManagerJSON = {
            zones,
            uuid,
            name,
            boundingZones: this.boundingZones.toJSON()
        };

        return jsonObject;
    }

    static fromJSON(editor: Editor, data: CSGManagerJSON) {
        let manager = new CSGManager(editor);
        if (!data)
            console.warn('Passed empty data to load CSGManager', data)
        else
            manager.uuid = data.uuid;

        manager.name = data.name;

        data.zones.forEach((zone) => {

            manager.add(CSGZone.fromJSON(editor, zone));

        });

        manager.boundingZones = BoundingZones.fromJSON(editor, data.boundingZones);

        return manager;

    }

    loadFrom(manager: CSGManager) {
        this.children = manager.children;
        this.boundingZones = manager.boundingZones;
    }

    clone(recursive: boolean) {
        return new CSGManager(this.editor).copy(this, recursive) as this;
    }

    reset() {

        this.name = 'Zones';
        this.userData = {};
        this.background = null;
        this.environment = null;

        this.clear();

        this.boundingZones.reset();

        return this;
    }

    getObjectById(id: number) {
        return this.boundingZones.getObjectById(id) ?? super.getObjectById(id);
    }

    handleZoneEmpty(zone: CSGZone) {
        console.log("handleZoneEmpty");
        this.remove(zone);
    }

}
export const isCSGManager = (x: any): x is CSGManager => x instanceof CSGManager;
