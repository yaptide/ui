import { Signal } from "signals";
import * as THREE from "three";
import { debounce } from "throttle-debounce";
import { ICSGWorker } from "./CSGWorker";
import * as Comlink from "comlink";
import { Editor } from "../../js/Editor";
import CSG from "../../js/libs/csg/three-csg";
import { CSGOperation, CSGOperationJSON } from "./CSGOperation";
import SimulationMaterial from "../Materials/SimulationMaterial";

export interface CSGZoneJSON {
    uuid: string;
    name: string;
    unionOperations: CSGOperationJSON[][];
    subscribedObjectsUuid: string[];
    materialName: string;
}

export class CSGZone extends THREE.Mesh {
    unionOperations: CSGOperation[][];

    subscribedObjectsUuid: Set<string>;
    needsUpdate: boolean = true;
    private signals: {
        objectChanged: Signal<THREE.Object3D>;
        objectRemoved: Signal<THREE.Object3D>;
        geometryChanged: Signal<THREE.Object3D>;
        sceneGraphChanged: Signal;
        zoneAdded: Signal<CSGZone>;
        zoneGeometryChanged: Signal<CSGZone>;
        zoneRemoved: Signal<CSGZone>;
        zoneChanged: Signal<CSGZone>;
        zoneEmpty: Signal<CSGZone>;
        CSGManagerStateChanged: Signal;
    };
    readonly isCSGZone: true = true;

    worker?: Comlink.Remote<ICSGWorker>;
    readonly debouncedUpdatePreview = debounce(200, false, () =>
        this.updatePreview()
    );

    private editor: Editor;

    constructor(
        editor: Editor,
        name?: string,
        unionOperations?: CSGOperation[][],
        subscribedObjectsUuid?: Set<string>, // TODO: replace Set with Map to correctly trace uuids
        uuid?: string,
        materialName?: string
    ) {
        super();
        this.type = "Zone";
        uuid && (this.uuid = uuid);
        this.editor = editor;
        this.signals = editor.signals;
        this.name = name || "CSGZone";
        this.material = editor.materialsManager.materials[materialName ?? ""];
        this.unionOperations = unionOperations ?? [];
        // If operations are specified, we have to populate set of subscribed UUID's
        this.subscribedObjectsUuid = subscribedObjectsUuid ?? this.populateSubscribedUuid(this.unionOperations);
        
        // If operations are specified, we have to generate fist geometry manually.
        unionOperations && this.updateGeometry();

        this.signals.geometryChanged.add((object) => this.handleChange(object));
        this.signals.objectChanged.add((object) => this.handleChange(object));
        this.signals.objectRemoved.add((object) => this.handleRemoved(object));
    }

    private populateSubscribedUuid(operations:CSGOperation[][]): Set<string> {
        return new Set(
            operations.flatMap(operationRow => operationRow.map(operation => operation.object.uuid))
        );
    }

    clone(recursive: boolean) {
        let clonedZone: this = new CSGZone(
            this.editor,
            this.name,
            this.unionOperations,
            this.subscribedObjectsUuid
        ).copy(this, recursive) as this;

        return clonedZone;
    }

    updateGeometry(): void  {
        console.time("CSGZone");
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
                    "left-subtraction": () => lastBsp.subtract(objectBsp),
                    intersection: () => lastBsp.intersect(objectBsp),
                    "right-subtraction": () => objectBsp.subtract(lastBsp),
                    union: () => lastBsp.union(objectBsp),
                };

                operationsResultBsp = handleMode[operation.mode]();
            }

            unionsResultBsp = unionsResultBsp.union(operationsResultBsp);
        }

        let geometryResult = CSG.toGeometry(unionsResultBsp, this.matrix);

        this.geometry.dispose();
        this.geometry = geometryResult;
        this.geometry.computeBoundingSphere();
        this.updateMatrixWorld(true);

        this.signals.zoneGeometryChanged.dispatch(this);
        console.timeEnd("CSGZone");
    }

    addUnion(): void  {
        this.unionOperations.push([]);

        this.announceChangedState();
    }

    updateUnion(unionIndex: number, operations: CSGOperation[]): void  {
        this.unionOperations[unionIndex].forEach((e, i) =>
            this.subscribedObjectsUuid.delete(e.object.uuid)
        );

        this.unionOperations[unionIndex] = [...operations];

        this.unionOperations[unionIndex].forEach((e, i) =>
            this.subscribedObjectsUuid.add(e.object.uuid)
        );

        this.announceChangedState();
    }

    removeUnion(unionIndex: number): void  {
        this.unionOperations[unionIndex].forEach((e, i) =>
            this.removeOperation(unionIndex, i)
        );

        this.unionOperations.splice(unionIndex, 1);

        this.announceChangedState();
    }

    addOperation(unionIndex: number, operation: CSGOperation): void  {
        this.unionOperations[unionIndex].push(operation);
        this.subscribedObjectsUuid.add(operation.object.uuid);

        this.announceChangedState();
    }

    removeOperation(unionIndex: number, operationIndex: number): void  {
        this.subscribedObjectsUuid.delete(
            this.unionOperations[unionIndex][operationIndex].object.uuid
        );

        this.unionOperations[unionIndex].splice(operationIndex, 1);

        this.announceChangedState();
    }

    handleChange(object: THREE.Object3D): void  {
        if (!this.subscribedObjectsUuid.has(object.uuid)) return;

        this.announceChangedState();
    }

    handleRemoved(object: THREE.Object3D): void  {
        if (!this.subscribedObjectsUuid.has(object.uuid)) return;

        this.unionOperations.forEach((operations, unionIndex) => {
            operations.forEach((operation, index) => {
                if (operation.object.uuid === object.uuid)
                    this.removeOperation(unionIndex, index);
            });

            if (operations.length === 0) this.removeUnion(unionIndex);
            else operations[0].mode = "union"; // ensure that first operation is union
        });

        if (this.unionOperations.length === 0)
            this.signals.zoneEmpty.dispatch(this);

        this.announceChangedState();
    }

    announceChangedState(): void  {
        this.debouncedUpdatePreview();

        this.signals.zoneChanged.dispatch(this);
        this.signals.CSGManagerStateChanged.dispatch();
    }

    updatePreview(): void  {
        this.needsUpdate = true;

        this.updateGeometry();

        this.signals.objectChanged.dispatch(this);
        this.signals.sceneGraphChanged.dispatch();
    }

    toJSON() {
        let unionOperations = this.unionOperations.map((union) =>
            union.map((operation) => operation.toJSON())
        );
        let jsonObject: CSGZoneJSON = {
            uuid: this.uuid,
            name: this.name,
            unionOperations,
            subscribedObjectsUuid: Array.from(this.subscribedObjectsUuid),
            materialName: this.getSimulationMaterial().name,
        };
        return jsonObject;
    }

    getSimulationMaterial(): SimulationMaterial {
        return this.material as SimulationMaterial;
    }

    static fromJSON(editor: Editor, data: CSGZoneJSON) {
        let unionOperations = data.unionOperations.map((union) =>
            union.map((operation) => CSGOperation.fromJSON(editor, operation))
        );

        let subscribedObjectsUuid;
        
        if(Array.isArray(data.subscribedObjectsUuid))
            subscribedObjectsUuid = new Set(data.subscribedObjectsUuid)
        else throw Error(`SubscribedObjectsId is not array: ${typeof data.subscribedObjectsUuid}`);

        let zone = new CSGZone(
            editor,
            data.name,
            unionOperations,
            subscribedObjectsUuid,
            data.uuid,
            data.materialName
        );

        return zone;
    }
}


export const isCSGZone = (x: unknown): x is CSGZone => x instanceof CSGZone;

