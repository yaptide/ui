import { Signal } from 'signals';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { Editor } from '../js/Editor';
import CSG from '../js/libs/csg/three-csg';
import { debounce } from 'throttle-debounce';
import * as Comlink from 'comlink';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./CSGWorker';
import { ICSGWorker } from './CSGWorker';

interface CSGOperationJSON {
    objectUuid: string;
    mode: Operation;
}
export class CSGOperation {
    object: THREE.Object3D;
    mode: Operation;

    constructor(object: THREE.Object3D, mode: Operation) {
        this.object = object;
        this.mode = mode;
    }

    toJSON() {
        let jsonObject: CSGOperationJSON = {
            mode: this.mode,
            objectUuid: this.object.uuid
        };
        return jsonObject;
    }

    static formJSON(editor: Editor, data: CSGOperationJSON) {
        let object = editor.scene.getObjectByProperty('uuid', data.objectUuid);

        if (!object)
            throw new Error('Can not found object on scene: (uuid)' + data.objectUuid);

        if (!isOperation(data.mode))
            throw new Error('Mode contains not known operation: ' + data.mode);

        return new CSGOperation(object, data.mode);
    }

}

export type Operation = 'intersection' | 'left-subtraction' | 'right-subtraction' | 'union';

export function isOperation(string: string): string is Operation {
    return ['intersection', 'left-subtraction', 'right-subtraction', 'union'].includes(string);
}

interface CSGZoneJSON {
    uuid: string;
    name: string;
    unionOperations: CSGOperationJSON[][];
    subscribedObjectsUuid: string[];
}
export class CSGZone {
    uuid: string;
    name: string;
    resultMesh: THREE.Mesh;
    material: THREE.Material;
    unionOperations: CSGOperation[][];

    subscribedObjectsUuid: Set<string> = new Set();
    needsUpdate: boolean = true;
    private signals: {
        objectChanged: Signal<THREE.Object3D>,
        geometryChanged: Signal<THREE.Object3D>,
        sceneGraphChanged: Signal,
        CSGManagerStateChanged: Signal
    };

    worker?: Comlink.Remote<ICSGWorker>;
    readonly debouncedUpdatePreview = debounce(200, false, () => this.updatePreview());

    constructor(editor: Editor, name?: string, material?: THREE.Material, unionOperations?: CSGOperation[][]) {
        this.uuid = MathUtils.generateUUID();
        this.name = name || 'CSGZone';
        this.material = material || new THREE.MeshNormalMaterial();
        this.resultMesh = new THREE.Mesh()
        this.resultMesh.name = this.name;
        this.resultMesh.material = this.material;

        this.unionOperations = unionOperations || [];

        this.signals = editor.signals;

        this.signals.geometryChanged.add((object) => this.handleSignal(object));
        this.signals.objectChanged.add((object) => this.handleSignal(object));
    }

    updateGeometry() {
        console.time('CSGZone');
        let unionsResultBsp = new CSG();

        for (let i = 0; i < this.unionOperations.length; i++) {
            const operations = this.unionOperations[i];

            let operationsResultBsp = new CSG();

            for (let index = 0; index < operations.length; index++) {
                const operation = operations[index];
                let lastBsp = operationsResultBsp;

                operation.object.updateMatrix();

                // TODO: use worker to offload main thread
                // this.worker?.parse(JSON.stringify(operation.object))
                //     .then((json: string) => new THREE.ObjectLoader().parseAsync(JSON.parse(json)))
                //     .then(console.log);

                let objectBsp = CSG.fromMesh(operation.object as THREE.Mesh);

                let handleMode = {
                    'left-subtraction': () => lastBsp.subtract(objectBsp),
                    'intersection': () => lastBsp.intersect(objectBsp),
                    'right-subtraction': () => objectBsp.subtract(lastBsp),
                    'union': () => lastBsp.union(objectBsp),
                }

                operationsResultBsp = handleMode[operation.mode]();
            }

            unionsResultBsp = unionsResultBsp.union(operationsResultBsp);
        }


        let geometryResult = CSG.toGeometry(unionsResultBsp, this.resultMesh.matrix);

        this.resultMesh.geometry.dispose();
        this.resultMesh.geometry = geometryResult;
        this.resultMesh.geometry.computeBoundingSphere();
        console.timeEnd('CSGZone');
    }

    addUnion() {
        this.unionOperations.push([]);
        this.announceChangedState();

        this.signals.CSGManagerStateChanged.dispatch();
    }

    updateUnion(unionIndex: number, operations: CSGOperation[]) {
        this.unionOperations[unionIndex].forEach((e, i) => this.subscribedObjectsUuid.delete(e.object.uuid));
        this.unionOperations[unionIndex] = [...operations];
        this.unionOperations[unionIndex].forEach((e, i) => this.subscribedObjectsUuid.add(e.object.uuid));
        this.announceChangedState();
    }

    removeUnion(unionIndex: number) {
        this.unionOperations[unionIndex].forEach((e, i) => this.removeOperation(unionIndex, i));
        this.unionOperations.splice(unionIndex, 1);
        this.announceChangedState();
    }

    addOperation(unionIndex: number, operation: CSGOperation) {
        this.unionOperations[unionIndex].push(operation);
        this.subscribedObjectsUuid.add(operation.object.uuid);
        this.announceChangedState();
    }

    removeOperation(unionIndex: number, operationIndex: number) {
        this.unionOperations[unionIndex].splice(operationIndex, 1);
        this.subscribedObjectsUuid.delete(this.unionOperations[unionIndex][operationIndex].object.uuid);
        this.announceChangedState();
    }

    handleSignal(object: THREE.Object3D) {
        if (!this.subscribedObjectsUuid.has(object.uuid)) return;

        this.announceChangedState();
    }

    announceChangedState() {
        this.debouncedUpdatePreview();

        this.signals.CSGManagerStateChanged.dispatch();
    }

    updatePreview() {
        this.needsUpdate = true;

        this.updateGeometry();

        this.signals.sceneGraphChanged.dispatch();
    }

    toJSON() {

        let unionOperations = this.unionOperations.map((union) => union.map((operation) => operation.toJSON()));

        let jsonObject: CSGZoneJSON = {
            uuid: this.uuid,
            name: this.name,
            unionOperations,
            subscribedObjectsUuid: Array.from(this.subscribedObjectsUuid)
        };
        return jsonObject;
    }

    static fromJSON(editor: Editor, data: CSGZoneJSON) {

        let zone = new CSGZone(editor);

        let unionOperations = data.unionOperations.map((union) => union.map((operation) => CSGOperation.formJSON(editor, operation)));
        zone.unionOperations = unionOperations;

        if (!Array.isArray(data.subscribedObjectsUuid))
            throw Error('SubscribedObjectsId is not array' + data.subscribedObjectsUuid);

        zone.subscribedObjectsUuid = new Set(data.subscribedObjectsUuid)

        return zone;
    }

}

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
        this.editor.sceneHelpers.remove(zone.resultMesh);
        this.zones.delete(zone.uuid);

        this.signals.CSGManagerStateChanged.dispatch();
    }

    addZone(zone: CSGZone) {
        zone.worker = this.worker;
        this.editor.sceneHelpers.add(zone.resultMesh);
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
