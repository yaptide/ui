import { Signal } from 'signals';
import * as THREE from 'three';
import { debounce } from 'throttle-debounce';
import { IZoneWorker } from './CSGWorker';
import * as Comlink from 'comlink';
import { Editor } from '../../js/Editor';
import CSG from '../../js/libs/csg/three-csg';
import { OperationTuple, OperationTupleJSON } from './CSGOperationTuple';
import { CounterMap } from './CounterMap';
import { SimulationZone, SimulationZoneJSON } from '../../Simulation/Base/SimZone';

export interface BooleanZoneJSON extends SimulationZoneJSON {
	unionOperations: OperationTupleJSON[][];
	subscribedObjects: Record<string, number>;
}

// interface MaterialPropertiesOverridesJSON {
// 	density?: number;
// }

// interface MaterialPropertiesOverrides {
// 	density: {
// 		override: boolean;
// 		value: number;
// 	};
// }

// const _get_default = (material: SimulationMaterial) => {
// 	return {
// 		materialPropertiesOverrides: {
// 			density: {
// 				override: false,
// 				value: material.density
// 			}
// 		}
// 	};
// };

export class BooleanZone extends SimulationZone {
	// readonly notRemovable: boolean = false;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	private _unionOperations: OperationTuple[][];
	// private _materialPropertiesOverrides: MaterialPropertiesOverrides;
	// private usingCustomMaterial = false;

	// material: SimulationMaterial;
	subscribedObjects: CounterMap<string>;
	needsUpdate: boolean = true;
	private signals: {
		objectChanged: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		geometryChanged: Signal<THREE.Object3D>;
		sceneGraphChanged: Signal;
		zoneAdded: Signal<BooleanZone>;
		zoneGeometryChanged: Signal<BooleanZone>;
		zoneRemoved: Signal<BooleanZone>;
		zoneChanged: Signal<BooleanZone>;
		zoneEmpty: Signal<BooleanZone>;
		CSGManagerStateChanged: Signal;
	};
	// readonly isZone: true = true;

	//CSG OPERATIONS
	set unionOperations(operations: OperationTuple[][]) {
		this._unionOperations = operations;
		// If operations are specified, we have to generate geometry.
		this.updateGeometry();
	}
	get unionOperations() {
		return this._unionOperations;
	}

	// set materialPropertiesOverrides(overrides: MaterialPropertiesOverrides) {
	// 	this._materialPropertiesOverrides = {
	// 		...overrides
	// 	};

	// 	const isCurrentlyUsingCustomMaterial = this.somePropertyOverridden();

	// 	if (isCurrentlyUsingCustomMaterial !== this.usingCustomMaterial) {
	// 		this.usingCustomMaterial = isCurrentlyUsingCustomMaterial;

	// 		if (this.usingCustomMaterial) this.material.decrement();
	// 		else this.material.increment();
	// 	}
	// }

	// get materialPropertiesOverrides() {
	// 	return this._materialPropertiesOverrides;
	// }

	worker?: Comlink.Remote<IZoneWorker>;
	readonly debouncedUpdatePreview = debounce(200, () => this.updatePreview(), { atBegin: false });

	constructor(editor: Editor, name?: string) {
		super(editor, name ?? 'BooleanZone');
		this.signals = editor.signals;
		// this.name = name || `Zone`;
		// this.material = editor.materialManager.defaultMaterial;
		// this.material.increment();
		this._unionOperations = [];
		this.subscribedObjects = new CounterMap<string>();
		// this._materialPropertiesOverrides = {
		// 	..._get_default(this.material).materialPropertiesOverrides
		// };

		this.signals.geometryChanged.add(object => this.handleChange(object));
		this.signals.objectChanged.add(object => this.handleChange(object));
		this.signals.objectRemoved.add(object => this.handleRemoved(object));
		this.addUnion();
	}

	// get simulationMaterial(): SimulationMaterial {
	// 	return this.material;
	// }

	// set simulationMaterial(value: SimulationMaterial) {
	// 	this.material.decrement();
	// 	this.material = value;
	// 	this.resetCustomMaterial();
	// 	this.material.increment();
	// }

	clone(recursive: boolean) {
		const clonedZone: this = new BooleanZone(this.editor, this.name).copy(
			this,
			recursive
		) as this;

		return clonedZone;
	}

	copy(source: this, recursive: boolean): this {
		super.copy(source, recursive);

		// this.simulationMaterial = source.material;
		this.subscribedObjects = source.subscribedObjects;
		this.unionOperations = source.unionOperations;
		// this._materialPropertiesOverrides = { ...source.materialPropertiesOverrides };

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
		this.signals.CSGManagerStateChanged.dispatch();
	}

	updatePreview(): void {
		if (!this.parent) return;

		this.needsUpdate = true;

		this.updateGeometry();

		this.signals.objectChanged.dispatch(this);
		this.signals.sceneGraphChanged.dispatch();
	}

	// private resetCustomMaterial(): void {
	// 	this._materialPropertiesOverrides = {
	// 		..._get_default(this.material).materialPropertiesOverrides
	// 	};
	// 	this.usingCustomMaterial = false;
	// }

	// private somePropertyOverridden(): boolean {
	// 	for (const key in this.materialPropertiesOverrides) {
	// 		const value =
	// 			this.materialPropertiesOverrides[
	// 				key as keyof typeof this.materialPropertiesOverrides
	// 			];
	// 		if (!value.override) continue;
	// 		return true;
	// 	}
	// 	return false;
	// }

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

	static fromJSON(editor: Editor, json: BooleanZoneJSON) {
		const zone = new BooleanZone(editor);
		return zone.fromJSON(json);
	}
}

export const isZone = (x: unknown): x is BooleanZone => x instanceof BooleanZone;
