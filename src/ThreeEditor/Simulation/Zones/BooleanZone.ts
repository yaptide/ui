import * as Comlink from 'comlink';
import * as THREE from 'three';
import { CounterMap } from '../../../util/CounterMap/CounterMap';
import { OperationTuple, OperationTupleJSON } from '../../CSG/CSGOperationTuple';
import { Signal } from 'signals';
import { SimulationZone, SimulationZoneJSON } from '../Base/SimulationZone';
import { YaptideEditor } from '../../js/YaptideEditor';
import { ZoneWorker } from '../../CSG/CSGWorker';
import { debounce } from 'throttle-debounce';
import CSG from '../../js/libs/csg/three-csg';

export interface BooleanZoneJSON extends SimulationZoneJSON {
	unionOperations: OperationTupleJSON[][];
	subscribedObjects: Record<string, number>;
}

export class BooleanZone extends SimulationZone {
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	private _unionOperations: OperationTuple[][];

	subscribedObjects: CounterMap<string>;
	needsUpdate: boolean = true;
	private signals: {
		objectChanged: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		geometryChanged: Signal<THREE.Object3D>;
		sceneGraphChanged: Signal;
		zoneGeometryChanged: Signal<BooleanZone>;
		zoneChanged: Signal<BooleanZone>;
		zoneEmpty: Signal<BooleanZone>;
	};

	set unionOperations(operations: OperationTuple[][]) {
		this._unionOperations = operations;
		// If operations are specified, we have to generate geometry.
		this.updateGeometry();
	}

	get unionOperations() {
		return this._unionOperations;
	}

	worker?: Comlink.Remote<ZoneWorker>;
	readonly debouncedUpdatePreview = debounce(200, () => this.updatePreview(), { atBegin: false });

	constructor(editor: YaptideEditor) {
		super(editor, 'Boolean Zone', 'BooleanZone');
		this.signals = editor.signals;
		this._unionOperations = [];
		this.subscribedObjects = new CounterMap<string>();

		this.signals.geometryChanged.add(object => this.handleChange(object));
		this.signals.objectChanged.add(object => this.handleChange(object));
		this.signals.objectRemoved.add(object => this.handleRemoved(object));
		this.addUnion();
	}

	copy(source: this, recursive: boolean): this {
		super.copy(source, recursive);

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

	addUnion(unionIndex?: number, operations: OperationTuple[] = []): void {
		if (unionIndex === undefined) unionIndex = this.unionOperations.length;
		const rest = this.unionOperations.splice(unionIndex);
		this.unionOperations.push(...[operations, ...rest]);

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

	removeUnion(unionIndex: number = this.unionOperations.length - 1): void {
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
	}

	updatePreview(): void {
		if (!this.parent) return;

		this.needsUpdate = true;

		this.updateGeometry();

		this.signals.objectChanged.dispatch(this);
		this.signals.sceneGraphChanged.dispatch();
	}

	toJSON(): BooleanZoneJSON {
		const json = super.toJSON();
		const unionOperations = this.unionOperations.map(union =>
			union.map(operation => operation.toJSON())
		);
		const subscribedObjects = this.subscribedObjects.toJSON();

		return {
			...json,
			unionOperations,
			subscribedObjects
		};
	}

	fromJSON(json: BooleanZoneJSON): this {
		const { editor } = this;
		const {
			unionOperations: operationsJSON,
			subscribedObjects: objectsJSON,
			...basicJSON
		} = json;
		super.fromJSON(basicJSON);
		this.unionOperations = operationsJSON.map(union =>
			union.map(operation => OperationTuple.fromJSON(editor, operation))
		);

		this.subscribedObjects = new CounterMap().fromJSON(objectsJSON);

		return this;
	}

	static fromJSON(editor: YaptideEditor, json: BooleanZoneJSON) {
		const zone = new BooleanZone(editor);
		return zone.fromJSON(json);
	}
}

export const isBooleanZone = (x: unknown): x is BooleanZone => x instanceof BooleanZone;
