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

export class CSGManager extends THREE.Scene{
    private editor: Editor;
    worker: Comlink.Remote<ICSGWorker>;
    zonesContainer: THREE.Group;
    readonly isCSGManager: true = true;

    constructor(editor: Editor) {
        super();
        this.zonesContainer = new THREE.Group();
        this.zonesContainer.name = "Zones";
        this.add(this.zonesContainer);
        this.worker = Comlink.wrap<ICSGWorker>(new Worker());
        this.editor = editor;
    }

    createZone() {
        let zone = new CSGZone(this.editor);
        this.addZone(zone);
        this.editor.signals.objectAdded.dispatch(zone);
		this.editor.signals.sceneGraphChanged.dispatch();
        this.editor.signals.CSGManagerStateChanged.dispatch();

        return zone;
    }

    addZone(zone: CSGZone) {
        zone.worker = this.worker;
        return this.zonesContainer.add(zone);
    }

    removeZone(zone: CSGZone) {
        console.log("Removing: ",zone);
        return this.zonesContainer.remove(zone);
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

    clone(recursive: boolean) {
        return new CSGManager(this.editor).copy(this, recursive) as this;
    }

}