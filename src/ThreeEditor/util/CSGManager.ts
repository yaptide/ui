import { Signal } from "signals";
import * as THREE from "three";
import { MathUtils } from "three";
import { Editor } from "../js/Editor";
import CSG from "../js/libs/csg/three-csg";

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
        let unionsResultBsp = new CSG();

        for (let i = 0; i < this.unionOperations.length; i++) {
            const operations = this.unionOperations[i];

            let operationsResultBsp = new CSG();

            for (let index = 0; index < operations.length; index++) {
                const operation = operations[index];
                let lastBsp = operationsResultBsp;

                operation.object.updateMatrix();

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
    }

    addUnion() {
        this.unionOperations.push([]);
        this.updatePreview();
    }

    updateUnion(unionIndex: number, operations: CSGOperation[]) {
        this.unionOperations[unionIndex].forEach((e, i) => this.subscribedObjectsId.delete(e.object.id));
        this.unionOperations[unionIndex] = [...operations];
        this.unionOperations[unionIndex].forEach((e, i) => this.subscribedObjectsId.add(e.object.id));
        this.updatePreview();
    }

    removeUnion(unionIndex: number) {
        this.unionOperations[unionIndex].forEach((e, i) => this.removeOperation(unionIndex, i));
        this.unionOperations.splice(unionIndex, 0);
        this.updatePreview();
    }

    addOperation(unionIndex: number, operation: CSGOperation) {
        this.unionOperations[unionIndex].push(operation);
        this.subscribedObjectsId.add(operation.object.id);
        this.updatePreview();
    }

    removeOperation(unionIndex: number, operationIndex: number) {
        this.unionOperations[unionIndex].splice(operationIndex, 0);
        this.subscribedObjectsId.delete(this.unionOperations[unionIndex][operationIndex].object.id);
        this.updatePreview();
    }

    handleSignal(object: THREE.Object3D) {
        if (!this.subscribedObjectsId.has(object.id)) return;

        this.updatePreview();
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

    constructor(editor: Editor) {
        this.editor = editor;
    }

    createZone() {
        let zone = new CSGZone(this.editor);
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