import * as Comlink from 'comlink';
import { Signal } from 'signals';
import * as THREE from 'three';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./CSGWorker';
import { Editor } from '../../js/Editor';
import { BoundingZone, BoundingZoneJSON } from '../BoundingZone';
import { ISimulationObject } from '../SimulationObject';
import { IZoneWorker } from './CSGWorker';
import { Zone, ZoneJSON } from './CSGZone';


interface ZoneManagerJSON {
    uuid: string,
    name: string,
    zones: ZoneJSON[],
    boundingZone: BoundingZoneJSON
}

export class ZonesContainer extends THREE.Group implements ISimulationObject {
    readonly notRemovable = true;
    readonly notMovable = true;
    readonly notRotatable = true;
    readonly notScalable = true;

    children: Zone[];
    readonly isZonesContainer: true = true;
    constructor(){
        super();
        this.name = "Zones";
        this.children = [];
    }
}

export class ZoneManager extends THREE.Scene implements ISimulationObject {
    readonly notRemovable = true;
    readonly notMovable = true;
    readonly notRotatable = true;
    readonly notScalable = true;

    editor: Editor;
    worker: Comlink.Remote<IZoneWorker>;
    boundingZone: BoundingZone;
    zonesContainer: ZonesContainer;
    private signals: {
        objectAdded: Signal<THREE.Object3D>;
        zoneAdded: Signal<Zone>;
        zoneEmpty: Signal<Zone>;
        objectRemoved: Signal<THREE.Object3D>;
        zoneRemoved: Signal<Zone>;
        sceneGraphChanged: Signal;
        CSGManagerStateChanged: Signal;
    };
    readonly isZoneManager: true = true;

    constructor(editor: Editor) {
        super();
        this.zonesContainer = new ZonesContainer();
        const light = new THREE.HemisphereLight( 0xffffff, 0x222222, 1 );
        light.position.set(15,15,15);
        this.add(light);
        this.add(this.zonesContainer);
        this.worker = Comlink.wrap<IZoneWorker>(new Worker());
        this.editor = editor;
        this.signals = editor.signals;

        this.boundingZone = new BoundingZone(editor);
        this.boundingZone.addHelpersToSceneHelpers();
        this.boundingZone.name = "World Zone"

        this.add(this.boundingZone);

        this.signals.zoneEmpty.add((zone: Zone) => this.handleZoneEmpty(zone));

    }

    createZone() {
        const zone = new Zone(this.editor);
        this.addZone(zone);
        return zone;
    }

    addZone(zone: Zone): void  {
        zone.worker = this.worker;
        this.zonesContainer.add(zone);
              
        this.signals.objectAdded.dispatch(zone);
        this.signals.zoneAdded.dispatch(zone);
		this.signals.sceneGraphChanged.dispatch();
        this.signals.CSGManagerStateChanged.dispatch();
    }

    removeZone(zone: Zone): void  {
        this.zonesContainer.remove(zone);
        
        this.signals.objectRemoved.dispatch(zone);
        this.signals.zoneRemoved.dispatch(zone);
        this.signals.sceneGraphChanged.dispatch();
        this.signals.CSGManagerStateChanged.dispatch();
    }

    toJSON() {
        const zones = this.zonesContainer.children.map(zone => zone.toJSON());
        const uuid = this.uuid;
        const name = this.name;
        const boundingZone = this.boundingZone.toJSON();
        return {
            zones,
            uuid,
            name,
            boundingZone
        };
    }

    fromJSON(data: ZoneManagerJSON) {
        if (!data)
            console.error('Passed empty data to load CSGManager', data)

        this.uuid = data.uuid;

        this.name = data.name;

        data.zones.forEach((zone) => {

            this.addZone(Zone.fromJSON(this.editor, zone));

        });

        this.boundingZone.removeHelpersFromSceneHelpers();
        this.boundingZone = BoundingZone.fromJSON(this.editor, data.boundingZone);
        this.boundingZone.addHelpersToSceneHelpers();

        return this;
    }

    static fromJSON(editor: Editor, data: ZoneManagerJSON) {
        return new ZoneManager(editor).fromJSON(data);
    }

    clone(recursive: boolean) {
        return new ZoneManager(this.editor).copy(this, recursive) as this;
    }

    reset() {

        this.name = 'Zones';
        this.userData = {};
        this.background = null;
        this.environment = null;

        this.zonesContainer.clear();

        this.boundingZone.reset();

        return this;
    }

    getObjectById(id: number) {
        return this.boundingZone.getObjectById(id) ?? super.getObjectById(id);
    }
    
    getZoneById(id: number): Zone | undefined{
        return this.zonesContainer.children.find((zone: Zone) => zone.id === id);
    }

    handleZoneEmpty(zone: Zone): void  {
        this.removeZone(zone);
    }

    getZoneOptions(): Record<number,string>{
        const zoneOptions = this.zonesContainer.children.reduce((acc, zone: Zone) => {
            acc[zone.id] = zone.name;
            return acc;
        },{} as Record<number,string>);
        return zoneOptions;
    }

}

export const isZonesContainer = (x: unknown): x is ZonesContainer => x instanceof ZonesContainer;

export const isZoneManager = (x: unknown): x is ZoneManager => x instanceof ZoneManager;
