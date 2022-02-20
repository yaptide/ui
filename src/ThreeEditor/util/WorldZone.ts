import { Signal } from 'signals';
import * as THREE from 'three';
import { Color, LineBasicMaterial, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { debounce } from 'throttle-debounce';
import { Editor } from '../js/Editor';
import { getGeometryParameters, PossibleGeometryType } from './AdditionalUserData';
import SimulationMaterial from './Materials/SimulationMaterial';
import { SimulationObject3D } from './SimulationBase/SimulationMesh';

export interface WorldZoneJSON {
	uuid: string;
	type: string;
	center: THREE.Vector3;
	size: THREE.Vector3;
	geometryType: WorldZoneType;
	name: string;
	marginMultiplier: number;
	autoCalculate: boolean;
	materialUuid: string;
	userData?: {
		geometryType: string;
		position: THREE.Vector3Tuple;
		rotation: THREE.Vector3Tuple;
		parameters: {
			[key: string]: number;
		};
	};
}

export const BOUNDING_ZONE_TYPE = ['Sphere', 'Cylinder', 'Box'] as const;

export type WorldZoneType = typeof BOUNDING_ZONE_TYPE[number];

const _cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2).rotateX(
	Math.PI / 2
) as THREE.CylinderGeometry;

const _sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

const _materialDefault = new THREE.MeshBasicMaterial({
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

interface WorldZoneParams {
	box?: THREE.Box3;
	color?: THREE.ColorRepresentation;
	marginMultiplier?: number;
}

export class WorldZone extends SimulationObject3D {
	readonly notRemovable = true;
	get notMovable() {
		// custom get function to conditionally return notMoveable property;
		return this.autoCalculate && this.canCalculate();
	}
	readonly notRotatable = true;
	readonly notScalable = true;

	editor: Editor;

	box: THREE.Box3;
	marginMultiplier: number;

	// material: SimulationMaterial;

	private _material: MeshBasicMaterial;
	private _simulationMaterial: SimulationMaterial;

	readonly isWorldZone: true = true;

	private _autoCalculate: boolean = false;
	private _geometryType: WorldZoneType = 'Box';
	private boxHelper: THREE.Box3Helper;
	private cylinderMesh: THREE.Mesh<THREE.CylinderGeometry, MeshBasicMaterial>;
	private sphereMesh: THREE.Mesh<THREE.SphereGeometry, MeshBasicMaterial>;

	private signals: {
		objectChanged: Signal<THREE.Object3D>;
		sceneGraphChanged: Signal;
		objectSelected: Signal<THREE.Object3D>;
		autocalculateChanged: Signal<boolean>;
	};

	readonly debouncedCalculate = debounce(200, false, () => this.calculate());

	constructor(
		editor: Editor,
		{ box, color = 0xff0000, marginMultiplier = 1.1 }: WorldZoneParams = {}
	) {
		super(editor, 'World Zone', 'WorldZone');
		this.type = 'WorldZone';
		this.name = 'World Zone';
		this.editor = editor;
		this.signals = editor.signals;

		this.marginMultiplier = marginMultiplier;

		this._material = _materialDefault;
		this._simulationMaterial = editor.materialManager.defaultMaterial;
		this._simulationMaterial.increment();

		// watch for changes on material color
		const materialColorHandler = {
			get: (target: Color, prop: keyof Color) => {
				const result = Reflect.get(this.simulationMaterial.color, prop);
				return result;
			}
		};

		const proxyColor = new Proxy(new Color(color), materialColorHandler);
		this._material.color = proxyColor;

		this.box = box ?? new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		this.boxHelper = new THREE.Box3Helper(this.box, this._material.color);
		(this.boxHelper.material as LineBasicMaterial).color = proxyColor;
		this.boxHelper.name = 'boxHelper';

		this.cylinderMesh = new THREE.Mesh(_cylinderGeometry, this._material);
		this.cylinderMesh.name = 'cylinderMeshHelper';
		this.sphereMesh = new THREE.Mesh(_sphereGeometry, this._material);
		this.sphereMesh.name = 'sphereMeshHelper';

		this.geometryType = 'Box';

		const handleSignal = (object: Object3D) => {
			if (this.autoCalculate && !isWorldZone(object)) this.debouncedCalculate();
			else if (object === this) {
				this.getHelper(this.geometryType).visible = object.visible;
				this.signals.objectChanged.dispatch(this.getHelper(this.geometryType));
			}
		};
		this.signals.objectChanged.add(handleSignal);
		this.signals.sceneGraphChanged.add(handleSignal);
	}

	get material(): MeshBasicMaterial {
		return this._simulationMaterial;
	}

	get simulationMaterial(): SimulationMaterial {
		return this._simulationMaterial;
	}

	set simulationMaterial(value: SimulationMaterial) {
		this._simulationMaterial.decrement();
		this._simulationMaterial = value;
		this._material.color.setHex(value.color.getHex());
		this._simulationMaterial.increment();
	}

	get geometryType() {
		return this._geometryType;
	}

	set geometryType(value: WorldZoneType) {
		this._geometryType = value;
		this.setFromCenterAndSize(this.position, this.size);
		this.getAllHelpers().forEach(e => (e.visible = false));
		this.getHelper(value).visible = true;
		this.signals.objectChanged.dispatch(this);
	}

	get autoCalculate(): boolean {
		return this._autoCalculate;
	}

	set autoCalculate(value: boolean) {
		this._autoCalculate = value;
		if (this._autoCalculate) this.calculate();
		this.signals.autocalculateChanged.dispatch(value);
	}

	get center() {
		return this.box.getCenter(new Vector3());
	}

	set center(value: Vector3) {
		this.setFromCenterAndSize(value, this.size);
		this.position.copy(value);
	}

	get size() {
		return this.box.getSize(new Vector3());
	}

	set size(value: Vector3) {
		this.setFromCenterAndSize(this.center, value);
	}

	private getAllHelpers() {
		return [this.boxHelper, this.sphereMesh, this.cylinderMesh];
	}

	private getHelper(geometryType: WorldZoneType): Object3D {
		const obj = {
			Box: this.boxHelper,
			Cylinder: this.cylinderMesh,
			Sphere: this.sphereMesh
		};
		return obj[geometryType];
	}

	canCalculate(): boolean {
		return this._geometryType === 'Box';
	}

	calculate(): void {
		if (!this.canCalculate()) return;

		this.setBoxFromObject(this.editor.zoneManager.zoneContainer);
	}

	setBoxFromObject(object: THREE.Object3D): void {
		this.updateBox(box => {
			box.setFromObject(object);
			this.addSafetyMarginToBox();
		});
	}

	setFromCenterAndSize(center: THREE.Vector3, size: THREE.Vector3): void {
		this.updateBox(box => {
			box.setFromCenterAndSize(center, size);

			this.sphereMesh.scale.setScalar(size.x);
			this.sphereMesh.position.copy(center);

			this.cylinderMesh.scale.set(Math.min(size.x, size.y), Math.min(size.x, size.y), size.z);
			this.cylinderMesh.position.copy(center);
		});
	}

	updatePosition(): void {
		this.position.copy(this.box.getCenter(new Vector3()));
	}

	updateBox(updateFunction: (box: THREE.Box3) => void): void {
		updateFunction(this.box);
		this.updatePosition();
		this.signals.objectChanged.dispatch(this);
	}

	makeCubeFromBox(): void {
		const size = this.box.getSize(new Vector3());
		const maxSize = Math.max(size.x, size.y, size.z);

		size.setScalar(maxSize);

		this.box.setFromCenterAndSize(this.box.getCenter(new Vector3()), size);
	}

	addSafetyMarginToBox(): void {
		const size = this.box.getSize(new Vector3());

		size.multiplyScalar(this.marginMultiplier);

		this.box.setFromCenterAndSize(this.box.getCenter(new Vector3()), size);
	}

	reset({ color = 0xff0000, name = 'World Zone' } = {}): void {
		this.debouncedCalculate.cancel();

		this._material.color.set(color);
		this.name = name;
		this.simulationMaterial = this.editor.materialManager.defaultMaterial;
		this.geometryType = 'Box';
		this.updateBox(box => box.setFromCenterAndSize(new Vector3(), new Vector3()));
	}

	addHelpersToSceneHelpers(): void {
		this.getAllHelpers().forEach(e => this.editor.sceneHelpers.add(e));
	}

	removeHelpersFromSceneHelpers(): void {
		this.getAllHelpers().forEach(e => this.editor.sceneHelpers.remove(e));
	}

	toJSON() {
		const geometry: {
			[K in WorldZoneType]: PossibleGeometryType;
		} = {
			Box: new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z),
			Sphere: new THREE.SphereGeometry(this.size.x),
			Cylinder: new THREE.CylinderGeometry(this.size.x, this.size.x, this.size.y)
		};
		const { uuid: materialUuid } = this.simulationMaterial;

		const jsonObject: WorldZoneJSON = {
			uuid: this.uuid,
			center: this.box.getCenter(new Vector3()),
			size: this.box.getSize(new Vector3()),
			type: this.type,
			geometryType: this._geometryType,
			name: this.name,
			marginMultiplier: this.marginMultiplier,
			autoCalculate: this.autoCalculate,
			materialUuid,
			userData: {
				geometryType: geometry[this._geometryType].type,
				parameters: getGeometryParameters(geometry[this._geometryType]),
				position: this.box.getCenter(new Vector3()).toArray(),
				rotation: this.rotation.toVector3().toArray()
			}
		};

		return jsonObject;
	}

	fromJSON(data: WorldZoneJSON) {
		this.geometryType = data.geometryType;
		this.name = data.name;

		this.marginMultiplier = data.marginMultiplier;

		this.setFromCenterAndSize(data.center, data.size);

		this.autoCalculate = data.autoCalculate;
		this.simulationMaterial =
			this.editor.materialManager.getMaterialByUuid(data.materialUuid) ??
			this.editor.materialManager.defaultMaterial;

		return this;
	}

	static fromJSON(editor: Editor, data: WorldZoneJSON) {
		return new WorldZone(editor).fromJSON(data);
	}

	copy(source: this, recursive = true) {
		super.copy(source, recursive);
		return this;
	}

	clone(recursive: boolean) {
		return new WorldZone(this.editor).copy(this, recursive) as this;
	}
}

export const isWorldZone = (x: unknown): x is WorldZone => x instanceof WorldZone;
