import * as Comlink from 'comlink';
import * as THREE from 'three';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./CSGWorker';
import { Editor } from '../../js/Editor';
import { ICSGWorker } from './CSGWorker';
import { CSGZone, CSGZoneJSON } from './CSGZone';


interface CSGManagerJSON {
    uuid: string,
    name: string,
    zones: CSGZoneJSON[]
}

export class CSGManager extends THREE.Scene {
    editor: Editor;
    worker: Comlink.Remote<ICSGWorker>;
    zonesContainer: THREE.Group;
    readonly isCSGManager: true = true;

    constructor(editor: Editor) {
        super();
        this.zonesContainer = new THREE.Group();
        this.zonesContainer.name = "Zones";
        let light = new THREE.HemisphereLight( 0xffffff, 0x222222, 1 );
        light.position.set(15,15,15);
        this.add(light);
        this.add(this.zonesContainer);
        this.worker = Comlink.wrap<ICSGWorker>(new Worker());
        this.editor = editor;

        this.editor.signals.zoneEmpty.add((zone: CSGZone) => this.handleZoneEmpty(zone));

    }

    createZone() {
        let zone = new CSGZone(this.editor);
        this.addZone(zone);
        this.editor.signals.objectAdded.dispatch(zone);
        this.editor.signals.CSGManagerStateChanged.dispatch();

        return zone;
    }

    addZone(zone: CSGZone) {
        zone.worker = this.worker;
        this.editor.addObject(zone, this.zonesContainer); 
              
        this.editor.signals.objectAdded.dispatch(zone);
        this.editor.signals.zoneAdded.dispatch(zone);
        this.editor.signals.CSGManagerStateChanged.dispatch();
    }

    removeZone(zone: CSGZone) {
        this.zonesContainer.remove(zone);
        
        this.editor.signals.objectAdded.dispatch(zone);
        this.editor.signals.zoneAdded.dispatch(zone);
        this.editor.signals.sceneGraphChanged.dispatch();
        this.editor.signals.CSGManagerStateChanged.dispatch();
    }

    toJSON() {
        let zones = this.zonesContainer.children.map((zone) => (zone as CSGZone).toJSON());
        let uuid = this.uuid;
        let name = this.name;
        let jsonObject: CSGManagerJSON = {
            zones,
            uuid,
            name
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

                manager.addZone(CSGZone.fromJSON(editor, zone));

        });

        return manager;

    }

    loadFrom(manager: CSGManager) {
        this.children = manager.children;
    }

    clone(recursive: boolean) {
        return new CSGManager(this.editor).copy(this, recursive) as this;
    }

    handleZoneEmpty(zone: CSGZone) {
        console.log("handleZoneEmpty");
        this.remove(zone);
    }

}
export const isCSGManager = (x: any): x is CSGManager => x instanceof CSGManager;
