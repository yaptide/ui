import * as THREE from 'three';
import { MeshBasicMaterial, Vector3 } from 'three';
import { Editor } from '../../../js/Editor';
import { PossibleGeometryType } from '../../../../util/AdditionalGeometryData';
import { WorldZoneType } from './WorldZone';

const _cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2).rotateX(
	Math.PI / 2
) as THREE.CylinderGeometry;

const _sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

const _defaultMarginMultiplier = 1.1;

export class WorldZoneHelper extends THREE.Object3D {
	/**
	 * Function returns THREE.Mesh based on type name on input
	 */
	getMeshType(type: WorldZoneType): THREE.Mesh<PossibleGeometryType, MeshBasicMaterial> {
		switch (type) {
			case 'Box':
				return this.boxMesh;
			case 'Cylinder':
				return this.cylinderMesh;
			case 'Sphere':
				return this.SphereFigure;
		}
	}
	get allHelpers(): Record<WorldZoneType, THREE.Object3D> {
		const obj = {
			Box: this._boxHelper,
			Cylinder: this.cylinderMesh,
			Sphere: this.SphereFigure
		};
		return obj;
	}

	editor: Editor;
	marginMultiplier: number;
	private _boxHelper: THREE.Box3Helper;
	private _box: THREE.Box3;
	private _cylinderMesh: THREE.Mesh<THREE.CylinderGeometry, MeshBasicMaterial>;
	private _SphereFigure: THREE.Mesh<THREE.SphereGeometry, MeshBasicMaterial>;

	get cylinderMesh(): THREE.Mesh<THREE.CylinderGeometry, MeshBasicMaterial> {
		return this._cylinderMesh;
	}
	get SphereFigure(): THREE.Mesh<THREE.SphereGeometry, MeshBasicMaterial> {
		return this._SphereFigure;
	}
	get boxMesh(): THREE.Mesh<THREE.BoxGeometry, MeshBasicMaterial> {
		const { x, y, z } = this._box.getSize(new THREE.Vector3());
		return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), this._SphereFigure.material);
	}

	set geometryType(type: WorldZoneType) {
		Object.entries(this.allHelpers).forEach(([key, mesh]) => (mesh.visible = key === type));
	}

	get center() {
		return this.position;
	}

	get size() {
		return this._box.getSize(new THREE.Vector3());
	}

	constructor(editor: Editor, material: MeshBasicMaterial) {
		super();
		this.editor = editor;
		this.marginMultiplier = _defaultMarginMultiplier;

		this._box = new THREE.Box3();
		this._boxHelper = new THREE.Box3Helper(this._box, material.color);
		// (this._boxHelper.material as THREE.LineBasicMaterial).color = material.color;

		this._cylinderMesh = new THREE.Mesh(_cylinderGeometry, material);
		this._SphereFigure = new THREE.Mesh(_sphereGeometry, material);

		this.add(this._boxHelper);
		this.add(this._cylinderMesh);
		this.add(this._SphereFigure);
	}

	/**
	 * Function creates wrapper around chosen Object3D with margin of space around it.
	 */
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

	/**
	 * Function updates dimensions of all helper objects based on new parameters.
	 */
	updateHelper(center: THREE.Vector3, size: THREE.Vector3, rotation?: THREE.Euler) {
		this.position.copy(center);
		if (rotation) this.rotation.copy(rotation);

		// Box
		this._box.setFromCenterAndSize(new Vector3(), size);

		// Cylinder
		this._cylinderMesh.geometry = new THREE.CylinderGeometry(
			size.x,
			size.x,
			size.z,
			16,
			1,
			false,
			0,
			Math.PI * 2
		).rotateX(Math.PI / 2) as THREE.CylinderGeometry;

		// Sphere
		this._SphereFigure.geometry = new THREE.SphereGeometry(
			size.x,
			16,
			8,
			0,
			Math.PI * 2,
			0,
			Math.PI
		);
	}

	reset() {
		this.updateHelper(new THREE.Vector3(), new THREE.Vector3());
	}
}
