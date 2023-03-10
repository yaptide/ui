import * as THREE from 'three';
import { Editor } from '../js/Editor';
import { SimulationMesh } from './SimulationBase/SimulationMesh';

const defaultMaterial = new THREE.MeshBasicMaterial({
	color: 0x000000,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

export const BASIC_GEOMETRY_OPTIONS = {
	Box: 'Box',
	Cylinder: 'Cylinder',
	Sphere: 'Sphere',
	CT: 'CT',
} as const;

export type BasicGeometry = typeof BASIC_GEOMETRY_OPTIONS[keyof typeof BASIC_GEOMETRY_OPTIONS];

export abstract class BasicMesh<
	TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry
> extends SimulationMesh<TGeometry> {
	geometryType: BasicGeometry;
	readonly isBasicMesh: true = true;
	constructor(
		editor: Editor,
		name: string | undefined,
		type: string,
		geometryType: BasicGeometry,
		geometry: TGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(editor, name, type, geometry, material ?? defaultMaterial.clone());
		this.name = name ?? `Figure`;
		this.geometryType = geometryType;
	}
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
export class BoxMesh extends BasicMesh<THREE.BoxGeometry> {
	constructor(editor: Editor, geometry?: THREE.BoxGeometry, material?: THREE.MeshBasicMaterial) {
		super(editor, 'Box', 'BoxMesh', 'Box', geometry ?? boxGeometry, material);
	}
}

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2).rotateX(
	Math.PI / 2
) as THREE.CylinderGeometry;

export class CylinderMesh extends BasicMesh<THREE.CylinderGeometry> {
	constructor(
		editor: Editor,
		geometry?: THREE.CylinderGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(
			editor,
			'Cylinder',
			'CylinderMesh',
			'Cylinder',
			geometry ?? cylinderGeometry,
			material
		);
	}
}

const sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

export class SphereMesh extends BasicMesh<THREE.SphereGeometry> {
	readonly notRotatable = true;
	constructor(
		editor: Editor,
		geometry?: THREE.SphereGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(editor, 'Sphere', 'SphereMesh', 'Sphere', geometry ?? sphereGeometry, material);
	}
}

const ctGeometry = new THREE.BoxGeometry(2, .5, 1, 1, 1, 1);
const ctMaterial = defaultMaterial.clone()
ctMaterial.color.setHex(0x00ff00);
export class CTMesh extends BasicMesh<THREE.BoxGeometry> {
	readonly notScalable = true;

	pathOnServer: string = '';

	constructor(editor: Editor, geometry?: THREE.BoxGeometry, material?: THREE.MeshBasicMaterial) {
		super(editor, 'CT', 'CTMesh', 'CT', geometry ?? ctGeometry, material ?? ctMaterial.clone());
	}

	toJSON(meta: { geometries: unknown; materials: unknown; textures: unknown; images: unknown; } | undefined) {
		const json = super.toJSON(meta);
		json.object.pathOnServer = this.pathOnServer;
		return json;
	}
}


export const isBasicMesh = (x: unknown): x is BasicMesh => x instanceof BasicMesh;

export const isBoxMesh = (x: unknown): x is BoxMesh => x instanceof BoxMesh;

export const isCylinderMesh = (x: unknown): x is CylinderMesh => x instanceof CylinderMesh;

export const isSphereMesh = (x: unknown): x is SphereMesh => x instanceof SphereMesh;

export const isCTMesh = (x: unknown): x is CTMesh => x instanceof CTMesh;
