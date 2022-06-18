import { Signal } from 'signals';
import * as THREE from 'three';
import { debounce } from 'throttle-debounce';
import { IZoneWorker } from './CSGWorker';
import * as Comlink from 'comlink';
import { Editor } from '../../js/Editor';
import CSG from '../../js/libs/csg/three-csg';
import { OperationTuple, OperationTupleJSON } from './CSGOperationTuple';
import SimulationMaterial from '../Materials/SimulationMaterial';
import { CounterMap } from './CounterMap';
import { SimulationMesh } from '../SimulationBase/SimulationMesh';

export interface ZoneJSON {
	uuid: string;
	name: string;
	unionOperations: OperationTupleJSON[][];
	subscribedObjects: Record<string, number>;
	materialUuid: string;
}

export class Zone extends SimulationMesh {
	readonly notRemovable = false;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	private _unionOperations: OperationTuple[][];

	material: SimulationMaterial;

	subscribedObjects: CounterMap<string>;
	needsUpdate: boolean = true;
	private signals: {
		objectChanged: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		geometryChanged: Signal<THREE.Object3D>;
		sceneGraphChanged: Signal;
		zoneAdded: Signal<Zone>;
		zoneGeometryChanged: Signal<Zone>;
		zoneRemoved: Signal<Zone>;
		zoneChanged: Signal<Zone>;
		zoneEmpty: Signal<Zone>;
		CSGManagerStateChanged: Signal;
	};
	readonly isZone: true = true;
	set unionOperations(operations: OperationTuple[][]) {
		this._unionOperations = operations;
		// If operations are specified, we have to generate geometry.
		this.updateGeometry();
	}
	get unionOperations() {
		return this._unionOperations;
	}

	worker?: Comlink.Remote<IZoneWorker>;
	readonly debouncedUpdatePreview = debounce(200, () => this.updatePreview(), { atBegin: false });

	constructor(editor: Editor, name?: string) {
		super(editor, name, 'Zone');
		this.signals = editor.signals;
		this.name = name || `Zone`;
		this.material = editor.materialManager.defaultMaterial;
		this.material.increment();
		this._unionOperations = [];
		this.subscribedObjects = new CounterMap<string>();

		this.signals.geometryChanged.add(object => this.handleChange(object));
		this.signals.objectChanged.add(object => this.handleChange(object));
		this.signals.objectRemoved.add(object => this.handleRemoved(object));
	}

	get simulationMaterial(): SimulationMaterial {
		return this.material;
	}

	set simulationMaterial(value: SimulationMaterial) {
		this.material.decrement();
		this.material = value;
		this.material.increment();
	}

	clone(recursive: boolean) {
		const clonedZone: this = new Zone(this.editor, this.name).copy(this, recursive) as this;

		return clonedZone;
	}

	copy(source: this, recursive: boolean): this {
		super.copy(source, recursive);

		this.simulationMaterial = source.material;
		this.subscribedObjects = source.subscribedObjects;
		this.unionOperations = source.unionOperations;

		return this;
	}

	updateGeometry(): void {
		console.time('CSGZone');
		this.geometry.dispose();

		if (this.unionOperations && this.unionOperations.length) {
			const unionsResultBsp = this.unionOperations.reduce((result, operationRow) => {
				const rowResult = operationRow.reduce((result, operation) => {
					return operation.execute(result);
				}, new CSG());
				return result.union(rowResult);
			}, new CSG());

			this.geometry = CSG.toGeometry(unionsResultBsp, this.matrix);
		}
		this.geometry.computeBoundingSphere();
		this.updateMatrixWorld(true);

		this.signals.zoneGeometryChanged.dispatch(this);
		console.timeEnd('CSGZone');
	}

	addUnion(): void {
		this.unionOperations.push([]);

		this.announceChangedState();
	}

	updateUnion(unionIndex: number, operations: OperationTuple[]): void {
		this.unionOperations[unionIndex].forEach(e => {
			this.subscribedObjects.decrement(e.object.uuid);
		});

		this.unionOperations[unionIndex] = [...operations];

		this.unionOperations[unionIndex].forEach(e => {
			this.subscribedObjects.increment(e.object.uuid);
		});

		this.announceChangedState();
	}

	removeUnion(unionIndex: number): void {
		this.unionOperations[unionIndex].forEach((e, i) => this.removeOperation(unionIndex, i));

		this.unionOperations.splice(unionIndex, 1);

		this.announceChangedState();
	}

	addOperation(unionIndex: number, operation: OperationTuple): void {
		this.unionOperations[unionIndex].push(operation);
		this.subscribedObjects.increment(operation.object.uuid);

		this.announceChangedState();
	}

	removeOperation(unionIndex: number, operationIndex: number): void {
		this.subscribedObjects.decrement(
			this.unionOperations[unionIndex][operationIndex].object.uuid
		);

		this.unionOperations[unionIndex].splice(operationIndex, 1);

		this.announceChangedState();
	}

	handleChange(object: THREE.Object3D): void {
		if (!this.subscribedObjects.has(object.uuid)) return;

		this.announceChangedState();
	}

	handleRemoved(object: THREE.Object3D): void {
		if (!this.subscribedObjects.has(object.uuid)) return;

		this.unionOperations.forEach((operations, unionIndex) => {
			operations.forEach((operation, index) => {
				if (operation.object.uuid === object.uuid) this.removeOperation(unionIndex, index);
			});

			if (operations.length === 0) this.removeUnion(unionIndex);
			else operations[0].mode = 'union'; // ensure that first operation is union
		});

		if (this.unionOperations.length === 0) this.signals.zoneEmpty.dispatch(this);

		this.announceChangedState();
	}

	announceChangedState(): void {
		this.debouncedUpdatePreview();

		this.signals.zoneChanged.dispatch(this);
		this.signals.CSGManagerStateChanged.dispatch();
	}

	updatePreview(): void {
		if (!this.parent) return;

		this.needsUpdate = true;

		this.updateGeometry();

		this.signals.objectChanged.dispatch(this);
		this.signals.sceneGraphChanged.dispatch();
	}

	toJSON() {
		const unionOperations = this.unionOperations.map(union =>
			union.map(operation => operation.toJSON())
		);
		const { uuid: materialUuid } = this.simulationMaterial;
		const subscribedObjects = this.subscribedObjects.toJSON();
		const { uuid, name } = this;
		return {
			uuid,
			name,
			materialUuid,
			unionOperations,
			subscribedObjects
		};
	}

	fromJSON(editor: Editor, data: ZoneJSON): Zone {
		this.uuid = data.uuid;
		this.name = data.name;

		this.unionOperations = data.unionOperations.map(union =>
			union.map(operation => OperationTuple.fromJSON(editor, operation))
		);

		this.subscribedObjects = new CounterMap().fromJSON(data.subscribedObjects);

		this.simulationMaterial =
			this.editor.materialManager.getMaterialByUuid(data.materialUuid) ??
			this.editor.materialManager.defaultMaterial;

		return this;
	}

	static fromJSON(editor: Editor, data: ZoneJSON) {
		const zone = new Zone(editor);
		return zone.fromJSON(editor, data);
	}
}

export const isZone = (x: unknown): x is Zone => x instanceof Zone;
