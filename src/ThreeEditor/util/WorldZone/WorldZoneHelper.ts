import * as THREE from 'three';
import { MeshBasicMaterial } from 'three';
import { Editor } from '../../js/Editor';
import { PossibleGeometryType } from '../AdditionalGeometryData';
import { WorldZoneType } from './WorldZone';

const _cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2).rotateX(
	Math.PI / 2
) as THREE.CylinderGeometry;

const _sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

const _defaultMarginMultiplier = 1.1;

export class WorldZoneHelper extends THREE.Object3D {
	get allHelpers(): Record<WorldZoneType, THREE.Mesh<PossibleGeometryType, MeshBasicMaterial>> {
		return {
			Box: this.boxMesh,
			Cylinder: this.cylinderMesh,
			Sphere: this.sphereMesh
		};
	}
	editor: Editor;
	marginMultiplier: number;
	private _boxHelper: THREE.Box3Helper;
	private _box: THREE.Box3;
	private _cylinderMesh: THREE.Mesh<THREE.CylinderGeometry, MeshBasicMaterial>;
	private _sphereMesh: THREE.Mesh<THREE.SphereGeometry, MeshBasicMaterial>;

	get cylinderMesh(): THREE.Mesh<THREE.CylinderGeometry, MeshBasicMaterial> {
		return this._cylinderMesh;
	}
	get sphereMesh(): THREE.Mesh<THREE.SphereGeometry, MeshBasicMaterial> {
		return this._sphereMesh;
	}
	get boxMesh(): THREE.Mesh<THREE.BoxGeometry, MeshBasicMaterial> {
		const { x, y, z } = this._box.getSize(new THREE.Vector3());
		return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), this._sphereMesh.material);
	}

	set geometryType(type: WorldZoneType) {
		Object.entries(this.allHelpers).forEach(([key, mesh]) => (mesh.visible = key === type));
	}

	get center() {
		return this._box.getCenter(new THREE.Vector3());
	}

	get size() {
		return this._box.getSize(new THREE.Vector3());
	}

	calculateFromObject(object: THREE.Object3D) {
		const size = new THREE.Vector3();
		const center = new THREE.Vector3();
		const box = new THREE.Box3().setFromObject(object);
		box.getSize(size);
		box.getCenter(center);
		this.updateHelper(
			center,
			size.multiplyScalar(this.marginMultiplier),
			new THREE.Euler(0, 0, 0)
		);
	}

	updateHelper(center: THREE.Vector3, size: THREE.Vector3, rotation?: THREE.Euler) {
		this._box.setFromCenterAndSize(center, size);

		this._cylinderMesh.position.copy(center);
		this._sphereMesh.position.copy(center);

		this._cylinderMesh.geometry.parameters.height = size.z;
		this._cylinderMesh.geometry.parameters.radiusTop = size.x / 2;
		this._cylinderMesh.geometry.parameters.radiusBottom = size.x / 2;
		this._sphereMesh.geometry.parameters.radius = size.x / 2;

		if (rotation) {
			this._cylinderMesh.rotation.copy(rotation);
			this._sphereMesh.rotation.copy(rotation);
		}
	}

	constructor(editor: Editor, material: MeshBasicMaterial) {
		super();
		this.editor = editor;
		this.marginMultiplier = _defaultMarginMultiplier;

		this._box = new THREE.Box3();
		this._boxHelper = new THREE.Box3Helper(this._box);
		(this._boxHelper.material as THREE.LineBasicMaterial).color = material.color;

		this._cylinderMesh = new THREE.Mesh(_cylinderGeometry, material);
		this._sphereMesh = new THREE.Mesh(_sphereGeometry, material);

		this.add(this._boxHelper);
		this.add(this._cylinderMesh);
		this.add(this._sphereMesh);
	}

	reset() {
		this.updateHelper(new THREE.Vector3(), new THREE.Vector3());
	}
}
