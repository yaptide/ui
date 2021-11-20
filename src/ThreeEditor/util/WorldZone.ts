import * as THREE from 'three';
import { Color, LineBasicMaterial, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { debounce } from 'throttle-debounce';

import { Editor } from '../js/Editor';
import { ISimulationObject } from './SimulationObject';

export interface WorldZoneJSON {
	type: string;
	center: THREE.Vector3;
	size: THREE.Vector3;
	geometryType: WorldZoneType;
	name: string;
	color: THREE.ColorRepresentation;
	marginMultiplier: number;
}

export const BOUNDING_ZONE_TYPE = ['sphere', 'cylinder', 'box'] as const;

export type WorldZoneType = typeof BOUNDING_ZONE_TYPE[number];

const _cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2);

const _sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

const _material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, wireframe: true });

interface WorldZoneParams {
	box?: THREE.Box3;
	color?: THREE.ColorRepresentation;
	marginMultiplier?: number;
}

export class WorldZone extends THREE.Object3D implements ISimulationObject {
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
	autoCalculate: boolean = true;
	material: MeshBasicMaterial;
	private _simulationMaterial?: MeshBasicMaterial;
	readonly isWorldZone: true = true;

	private _geometryType: WorldZoneType = 'box';
	private boxHelper: THREE.Box3Helper;
	private cylinderMesh: THREE.Mesh<THREE.CylinderGeometry, MeshBasicMaterial>;
	private sphereMesh: THREE.Mesh<THREE.SphereGeometry, MeshBasicMaterial>;

	readonly debouncedCalculate = debounce(200, false, () => this.calculate());

	constructor(editor: Editor, { box, color = 0xff0000, marginMultiplier = 1.1 }: WorldZoneParams = {}) {
		super();
		this.type = 'WorldZone';
		this.name = 'World Zone';
		this.editor = editor;

		this.marginMultiplier = marginMultiplier;

		this.material = _material;

		// watch for changes on material color
		const materialColorHandler = {
			set: (target: Color, prop: keyof Color, value: unknown) => {
				Reflect.set((this.boxHelper.material as LineBasicMaterial).color, prop, value);

				return Reflect.set(target, prop, value);
			},
		};

		const proxyColor = new Proxy(new Color(color), materialColorHandler);
		this.material.color = proxyColor;

		this.box = box ?? new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		this.boxHelper = new THREE.Box3Helper(this.box, this.material.color);
		this.boxHelper.name = 'boxHelper';

		this.cylinderMesh = new THREE.Mesh(_cylinderGeometry, this.material);
		this.cylinderMesh.name = 'cylinderMeshHelper';
		this.sphereMesh = new THREE.Mesh(_sphereGeometry, this.material);
		this.sphereMesh.name = 'sphereMeshHelper';

		this.geometryType = 'box';

		const handleSignal = (object: Object3D) => {
			if (this.autoCalculate && !isWorldZone(object)) this.debouncedCalculate();
		};
		this.editor.signals.objectChanged.add((object: Object3D) => handleSignal(object));
		this.editor.signals.sceneGraphChanged.add((object: Object3D) => handleSignal(object));
	}

	get simulationMaterial(): MeshBasicMaterial | undefined {
		return this._simulationMaterial;
	}

	set simulationMaterial(value: MeshBasicMaterial | undefined) {
		this._simulationMaterial = value;
		value && this.material.color.setHex(value.color.getHex());
	}

	get geometryType() {
		return this._geometryType;
	}

	set geometryType(value: WorldZoneType) {
		this._geometryType = value;
		this.getAllHelpers().forEach(e => (e.visible = false));
		this.getHelper(value).visible = true;
		this.editor.signals.objectChanged.dispatch(this);
	}

	private getAllHelpers() {
		return [this.boxHelper, this.sphereMesh, this.cylinderMesh];
	}

	private getHelper(geometryType: WorldZoneType): Object3D {
		const obj = {
			box: this.boxHelper,
			cylinder: this.cylinderMesh,
			sphere: this.sphereMesh,
		};
		return obj[geometryType];
	}

	canCalculate(): boolean {
		return this._geometryType === 'box';
	}

	calculate(): void {
		if (!this.canCalculate()) return;

		this.setBoxFromObject(this.editor.scene);
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

			this.cylinderMesh.scale.set(size.x, size.y, size.x);
			this.cylinderMesh.position.copy(center);
		});
	}

	updateBox(updateFunction: (box: THREE.Box3) => void): void {
		updateFunction(this.box);
		this.editor.signals.objectChanged.dispatch(this);
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
		this.material.color.set(color);
		this.name = name;
		this.updateBox(box => box.setFromCenterAndSize(new Vector3(), new Vector3()));
	}

	addHelpersToSceneHelpers(): void {
		this.getAllHelpers().forEach(e => this.editor.sceneHelpers.add(e));
	}

	removeHelpersFromSceneHelpers(): void {
		this.getAllHelpers().forEach(e => this.editor.sceneHelpers.remove(e));
	}

	toJSON() {
		const jsonObject: WorldZoneJSON = {
			center: this.box.getCenter(new Vector3()),
			size: this.box.getSize(new Vector3()),
			type: this.type,
			geometryType: this._geometryType,
			name: this.name,
			color: this.material.color.getHex(),
			marginMultiplier: this.marginMultiplier,
		};

		return jsonObject;
	}

	static fromJSON(editor: Editor, data: WorldZoneJSON) {
		const box = new THREE.Box3();
		box.setFromCenterAndSize(data.center, data.size);

		const object = new WorldZone(editor, { box, ...data });

		object.geometryType = data.geometryType;
		object.name = data.name;

		object.setFromCenterAndSize(data.center, data.size);

		return object;
	}

	copy(source: this, recursive = true) {
		return super.copy(source, recursive) as this;
	}

	clone(recursive: boolean) {
		return new WorldZone(this.editor).copy(this, recursive) as this;
	}
}

export const isWorldZone = (x: unknown): x is WorldZone => x instanceof WorldZone;
