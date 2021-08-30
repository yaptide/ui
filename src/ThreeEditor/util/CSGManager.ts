import { Signal } from "signals";
import * as THREE from "three";
import { MathUtils } from "three";
import { Editor } from "../js/Editor";
import CSG from "../js/libs/csg/three-csg";
import { debounce } from 'throttle-debounce';
import * as Comlink from 'comlink';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./CSGWorker';
import { ICSGWorker } from "./CSGWorker";

export interface CSGOperation {
    object: THREE.Object3D;
    mode: Operation;
}

export type Operation = "intersection" | "left-subtraction" | "right-subtraction" | "union";
export class CSGZone {
    uuid: string;
    name: string;
    resultMesh: THREE.Mesh;
    material: THREE.Material;
    unionOperations: CSGOperation[][];


    subscribedObjectsId: Set<number> = new Set();
    needsUpdate: boolean = true;
    signals: {
        objectChanged: Signal<THREE.Object3D>,
        geometryChanged: Signal<THREE.Object3D>,
        sceneGraphChanged: Signal,
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
        console.time("CSGZone");
        let unionsResultBsp = new CSG();

        for (let i = 0; i < this.unionOperations.length; i++) {
            const operations = this.unionOperations[i];

            let operationsResultBsp = new CSG();

            for (let index = 0; index < operations.length; index++) {
                const operation = operations[index];
                let lastBsp = operationsResultBsp;

                operation.object.updateMatrix();

                this.worker?.parse(JSON.stringify(operation.object))
                    .then((json: string) => new THREE.ObjectLoader().parseAsync(JSON.parse(json)))
                    .then(console.log);
                    
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
        console.timeEnd("CSGZone");
    }

    addUnion() {
        this.unionOperations.push([]);
        this.debouncedUpdatePreview();
    }

    updateUnion(unionIndex: number, operations: CSGOperation[]) {
        this.unionOperations[unionIndex].forEach((e, i) => this.subscribedObjectsId.delete(e.object.id));
        this.unionOperations[unionIndex] = [...operations];
        this.unionOperations[unionIndex].forEach((e, i) => this.subscribedObjectsId.add(e.object.id));
        this.debouncedUpdatePreview();
    }

    removeUnion(unionIndex: number) {
        this.unionOperations[unionIndex].forEach((e, i) => this.removeOperation(unionIndex, i));
        this.unionOperations.splice(unionIndex, 0);
        this.debouncedUpdatePreview();
    }

    addOperation(unionIndex: number, operation: CSGOperation) {
        this.unionOperations[unionIndex].push(operation);
        this.subscribedObjectsId.add(operation.object.id);
        this.debouncedUpdatePreview();
    }

    removeOperation(unionIndex: number, operationIndex: number) {
        this.unionOperations[unionIndex].splice(operationIndex, 0);
        this.subscribedObjectsId.delete(this.unionOperations[unionIndex][operationIndex].object.id);
        this.debouncedUpdatePreview();
    }

    handleSignal(object: THREE.Object3D) {
        if (!this.subscribedObjectsId.has(object.id)) return;

        this.debouncedUpdatePreview();
    }

    updatePreview() {
        this.needsUpdate = true;

        this.updateGeometry();



        this.signals.sceneGraphChanged.dispatch();
    }

}

class CSGManager {
    editor: Editor;
    zones: Map<String, CSGZone> = new Map();
    worker = Comlink.wrap<ICSGWorker>(new Worker());

    constructor(editor: Editor) {
        this.editor = editor;
    }

    createZone() {
        let zone = new CSGZone(this.editor);
        zone.worker = this.worker;
        this.editor.sceneHelpers.add(zone.resultMesh);
        this.zones.set(zone.uuid, zone);
        return zone;
    }

    removeZone(zone: CSGZone) {
        this.editor.sceneHelpers.remove(zone.resultMesh);
        this.zones.delete(zone.uuid);
    }


}

export { CSGManager }