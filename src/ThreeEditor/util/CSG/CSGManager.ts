import * as Comlink from 'comlink';
import * as THREE from 'three';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./CSGWorker';
import { Editor } from '../../js/Editor';
import { BoundingZone, BoundingZoneJSON } from '../BoundingZone';
import { ICSGWorker } from './CSGWorker';
import { CSGZone, CSGZoneJSON } from './CSGZone';


interface CSGManagerJSON {
    uuid: string,
    name: string,
    zones: CSGZoneJSON[],
    boundingZone: BoundingZoneJSON
}

export class CSGManager extends THREE.Scene {
    editor: Editor;
    worker: Comlink.Remote<ICSGWorker>;
    boundingZone: BoundingZone;

    constructor(editor: Editor) {
        super();
        this.type = 'ZonesManager' as any;
        this.name = "Zones";
        this.worker = Comlink.wrap<ICSGWorker>(new Worker());
        this.editor = editor;

        this.boundingZone = new BoundingZone(editor);
        editor.sceneHelpers.add(this.boundingZone.helper);
        this.boundingZone.name = "World Zone"

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
            boundingZone: this.boundingZone.toJSON()
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

        editor.sceneHelpers.remove(manager.boundingZone.helper);
        manager.boundingZone = BoundingZone.fromJSON(editor, data.boundingZone);
        editor.sceneHelpers.add(manager.boundingZone.helper);
        return manager;

    }

    loadFrom(manager: CSGManager) {
        this.children = manager.children;
        this.editor.sceneHelpers.remove(this.boundingZone.helper);
        this.boundingZone = manager.boundingZone;
        this.editor.sceneHelpers.add(this.boundingZone.helper);
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

        this.boundingZone.reset();

        return this;
    }

    getObjectById(id: number) {
        return this.boundingZone.getObjectById(id) ?? super.getObjectById(id);
    }

    handleZoneEmpty(zone: CSGZone) {
        console.log("handleZoneEmpty");
        this.remove(zone);
    }

}
export const isCSGManager = (x: any): x is CSGManager => x instanceof CSGManager;
