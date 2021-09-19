import { Signal } from "signals";
import * as THREE from "three";
import { debounce } from "throttle-debounce";
import { ICSGWorker } from "./CSGWorker";
import * as Comlink from "comlink";
import { Editor } from "../../js/Editor";
import CSG from "../../js/libs/csg/three-csg";
import { CSGOperation, CSGOperationJSON } from "./CSGOperation";

export interface CSGZoneJSON {
    uuid: string;
    name: string;
    unionOperations: CSGOperationJSON[][];
    subscribedObjectsUuid: string[];
}
export class CSGZone extends THREE.Mesh {
    unionOperations: CSGOperation[][];

    subscribedObjectsUuid: Set<string>;
    needsUpdate: boolean = true;
    private signals: {
        objectChanged: Signal<THREE.Object3D>;
        geometryChanged: Signal<THREE.Object3D>;
        sceneGraphChanged: Signal;
        zoneAdded: Signal<CSGZone>;
        zoneRemoved: Signal<CSGZone>;
        CSGManagerStateChanged: Signal;
    };

    worker?: Comlink.Remote<ICSGWorker>;
    readonly debouncedUpdatePreview = debounce(200, false, () =>
        this.updatePreview()
    );

    private editor: Editor;

    constructor(
        editor: Editor,
        name?: string,
        unionOperations?: CSGOperation[][],
        subscribedObjectsUuid?: Set<string>
    ) {
        super();
        this.type = "Zone";
        this.name = name || "CSGZone";
        this.material = new THREE.MeshNormalMaterial();
        this.subscribedObjectsUuid = subscribedObjectsUuid || new Set();
        this.unionOperations = unionOperations
            ? (() => {
                  // If operations are specified, we have to populate set of subscribed UUID's
                  subscribedObjectsUuid ||
                      unionOperations.forEach((op1) =>
                          op1
                              .map((op2) => op2.object.uuid)
                              .forEach(
                                  this.subscribedObjectsUuid.add,
                                  this.subscribedObjectsUuid
                              )
                      );
                  return unionOperations;
              })()
            : [];

        // If operations are specified, we have to generate fist geometry manually.
        unionOperations && this.updateGeometry();
        this.editor = editor;
        this.signals = editor.signals;

        this.signals.geometryChanged.add((object) => this.handleSignal(object));
        this.signals.objectChanged.add((object) => this.handleSignal(object));

        this.signals.zoneAdded.dispatch(this);
    }

	clone( recursive:boolean ) {
        let clonedZone :this = new CSGZone(this.editor, this.name, this.unionOperations, this.subscribedObjectsUuid).copy( this, recursive ) as this;
        return clonedZone;
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
        console.timeEnd("CSGZone");
    }

    addUnion() {
        this.unionOperations.push([]);
        this.announceChangedState();

        this.signals.CSGManagerStateChanged.dispatch();
    }

    updateUnion(unionIndex: number, operations: CSGOperation[]) {
        this.unionOperations[unionIndex].forEach((e, i) =>
            this.subscribedObjectsUuid.delete(e.object.uuid)
        );
        this.unionOperations[unionIndex] = [...operations];
        this.unionOperations[unionIndex].forEach((e, i) =>
            this.subscribedObjectsUuid.add(e.object.uuid)
        );
        this.announceChangedState();
    }

    removeUnion(unionIndex: number) {
        this.unionOperations[unionIndex]?.forEach((e, i) =>
            this.removeOperation(unionIndex, i)
        );
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
        this.subscribedObjectsUuid.delete(
            this.unionOperations[unionIndex][operationIndex]?.object.uuid
        );
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
        };
        return jsonObject;
    }

    static fromJSON(editor: Editor, data: CSGZoneJSON) {
        let unionOperations = data.unionOperations.map((union) =>
            union.map((operation) => CSGOperation.fromJSON(editor, operation))
        );
        let subscribedObjectsUuid = Array.isArray(data.subscribedObjectsUuid)
            ? new Set(data.subscribedObjectsUuid)
            : (() => {
                  throw Error(
                      "SubscribedObjectsId is not array" +
                          data.subscribedObjectsUuid
                  );
              })();

        let zone = new CSGZone(
            editor,
            data.name,
            unionOperations,
            subscribedObjectsUuid
        );

        return zone;
    }
}
export const isCSGZone = (x: any): x is CSGZone => x instanceof CSGZone;
