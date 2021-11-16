import { Signal } from 'signals';
import * as THREE from 'three';
import { debounce } from 'throttle-debounce';
import { ICSGWorker } from './CSGWorker';
import * as Comlink from 'comlink';
import { Editor } from '../../js/Editor';
import CSG from '../../js/libs/csg/three-csg';
import { CSGOperation, CSGOperationJSON } from './CSGOperation';
import SimulationMaterial from '../Materials/SimulationMaterial';
import { CounterMap } from './CounterMap';

export interface CSGZoneJSON {
    uuid: string;
    name: string;
    unionOperations: CSGOperationJSON[][];
    subscribedObjectsUuid: { [k: string]: number; };
    materialName: string;
    materialData: unknown;
}

export class CSGZone extends THREE.Mesh {
    unionOperations: CSGOperation[][];

    subscribedObjectsUuid: CounterMap<string>;
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
        subscribedObjectsUuid?: CounterMap<string>,
        uuid?: string,
        materialName?: string
    ) {
        super();
        this.type = 'Zone';
        uuid && (this.uuid = uuid);
        this.editor = editor;
        this.signals = editor.signals;
        this.name = name || 'CSGZone';
        this.material = editor.materialsManager.materials[materialName ?? ''];
        this.unionOperations = unionOperations ?? [];
        // If operations are specified, we have to populate set of subscribed UUID's
        this.subscribedObjectsUuid = subscribedObjectsUuid ?? this.populateSubscribedUuid(this.unionOperations);

        // If operations are specified, we have to generate fist geometry manually.
        unionOperations && this.updateGeometry();

        this.signals.geometryChanged.add((object) => this.handleChange(object));
        this.signals.objectChanged.add((object) => this.handleChange(object));
        this.signals.objectRemoved.add((object) => this.handleRemoved(object));
    }

    private populateSubscribedUuid(operations: CSGOperation[][]): CounterMap<string> {
        return new CounterMap(
            operations.flatMap(operationRow => operationRow.map(operation => operation.object.uuid))
        );
    }

    clone(recursive: boolean) {
        const clonedZone: this = new CSGZone(
            this.editor,
            this.name,
            this.unionOperations,
            this.subscribedObjectsUuid
        ).copy(this, recursive) as this;

        return clonedZone;
    }

    updateGeometry(): void {
        console.time('CSGZone');
        let unionsResultBsp = new CSG();

        for (let i = 0; i < this.unionOperations.length; i++) {
            const operations = this.unionOperations[i];

            let operationsResultBsp = new CSG();

            for (let index = 0; index < operations.length; index++) {
                const operation = operations[index];
                const lastBsp = operationsResultBsp;

                operation.object.updateMatrix();

                // TODO: use worker to offload main thread
                // this.worker?.parse(JSON.stringify(operation.object))
                //     .then((json: string) => new THREE.ObjectLoader().parseAsync(JSON.parse(json)))
                //     .then(console.log);

                const objectBsp = CSG.fromMesh(operation.object as THREE.Mesh);

                const handleMode = {
                    'left-subtraction': () => lastBsp.subtract(objectBsp),
                    intersection: () => lastBsp.intersect(objectBsp),
                    'right-subtraction': () => objectBsp.subtract(lastBsp),
                    union: () => lastBsp.union(objectBsp),
                };

                operationsResultBsp = handleMode[operation.mode]();
            }

            unionsResultBsp = unionsResultBsp.union(operationsResultBsp);
        }

        const geometryResult = CSG.toGeometry(unionsResultBsp, this.matrix);

        this.geometry.dispose();
        this.geometry = geometryResult;
        this.geometry.computeBoundingSphere();
        this.updateMatrixWorld(true);

        this.signals.zoneGeometryChanged.dispatch(this);
        console.timeEnd('CSGZone');
    }

    addUnion(): void {
        this.unionOperations.push([]);

        this.announceChangedState();
    }

    updateUnion(unionIndex: number, operations: CSGOperation[]): void {
        this.unionOperations[unionIndex].forEach((e) => {
            this.subscribedObjectsUuid.decrement(e.object.uuid);
        });

        this.unionOperations[unionIndex] = [...operations];

        this.unionOperations[unionIndex].forEach((e) => {
            this.subscribedObjectsUuid.increment(e.object.uuid);
        });

        this.announceChangedState();
    }

    removeUnion(unionIndex: number): void {
        this.unionOperations[unionIndex].forEach((e, i) =>
            this.removeOperation(unionIndex, i)
        );

        this.unionOperations.splice(unionIndex, 1);

        this.announceChangedState();
    }

    addOperation(unionIndex: number, operation: CSGOperation): void {
        this.unionOperations[unionIndex].push(operation);
        this.subscribedObjectsUuid.increment(operation.object.uuid);

        this.announceChangedState();
    }

    removeOperation(unionIndex: number, operationIndex: number): void {
        this.subscribedObjectsUuid.decrement(
            this.unionOperations[unionIndex][operationIndex].object.uuid
        );

        this.unionOperations[unionIndex].splice(operationIndex, 1);

        this.announceChangedState();
    }

    handleChange(object: THREE.Object3D): void {
        if (!this.subscribedObjectsUuid.has(object.uuid)) return;

        this.announceChangedState();
    }

    handleRemoved(object: THREE.Object3D): void {
        if (!this.subscribedObjectsUuid.has(object.uuid)) return;

        this.unionOperations.forEach((operations, unionIndex) => {
            operations.forEach((operation, index) => {
                if (operation.object.uuid === object.uuid)
                    this.removeOperation(unionIndex, index);
            });

            if (operations.length === 0) this.removeUnion(unionIndex);
            else operations[0].mode = 'union'; // ensure that first operation is union
        });

        if (this.unionOperations.length === 0)
            this.signals.zoneEmpty.dispatch(this);

        this.announceChangedState();
    }

    announceChangedState(): void {
        this.debouncedUpdatePreview();

        this.signals.zoneChanged.dispatch(this);
        this.signals.CSGManagerStateChanged.dispatch();
    }

    updatePreview(): void {
        this.needsUpdate = true;

        this.updateGeometry();

        this.signals.objectChanged.dispatch(this);
        this.signals.sceneGraphChanged.dispatch();
    }

    toJSON() {
        const unionOperations = this.unionOperations.map((union) =>
            union.map((operation) => operation.toJSON())
        );
        const jsonObject: CSGZoneJSON = {
            uuid: this.uuid,
            name: this.name,
            unionOperations,
            subscribedObjectsUuid: this.subscribedObjectsUuid.toJSON(),
            materialName: this.getSimulationMaterial().name,
            materialData: this.getSimulationMaterial().simulationData
        };
        return jsonObject;
    }

    getSimulationMaterial(): SimulationMaterial {
        return this.material as SimulationMaterial;
    }

    static fromJSON(editor: Editor, data: CSGZoneJSON) {
        const unionOperations = data.unionOperations.map((union) =>
            union.map((operation) => CSGOperation.fromJSON(editor, operation))
        );

        const subscribedObjectsUuid = new CounterMap().fromJSON(data.subscribedObjectsUuid);       

        const zone = new CSGZone(
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

