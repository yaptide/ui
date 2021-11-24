import * as THREE from 'three';
import { Editor } from '../js/Editor';
import { SimulationMesh } from './SimulationBase/SimulationMesh';
import { ISimulationObject } from './SimulationBase/SimulationObject';

const defaultMaterial = new THREE.MeshBasicMaterial({
	color: 0x000000,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

export abstract class BasicMesh<
	TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry
> extends SimulationMesh<TGeometry> {
	constructor(
		editor: Editor,
		name: string | undefined,
		type: string,
		geometry: TGeometry,
		material?: THREE.Material
	) {
		super(editor, name, type, geometry, material ?? defaultMaterial.clone());
		this.name = name ?? `Figure`;
	}
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
export class BoxMesh extends BasicMesh<THREE.BoxGeometry> {
	constructor(editor: Editor, geometry?: THREE.BoxGeometry, material?: THREE.Material) {
		super(editor, 'Box', 'BoxMesh', geometry ?? boxGeometry, material);
	}
}

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2);

export class CylinderMesh extends BasicMesh<THREE.CylinderGeometry> {
	constructor(editor: Editor, geometry?: THREE.CylinderGeometry, material?: THREE.Material) {
		super(editor, 'Cylinder', 'CylinderMesh', geometry ?? cylinderGeometry, material);
	}
}

const sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

export class SphereMesh extends BasicMesh<THREE.SphereGeometry> {
	readonly notRotatable = true;
	constructor(editor: Editor, geometry?: THREE.SphereGeometry, material?: THREE.Material) {
		super(editor, 'Sphere', 'SphereMesh', geometry ?? sphereGeometry, material);
	}
}

export const isBasicMesh = (x: unknown): x is BasicMesh => x instanceof BasicMesh;
