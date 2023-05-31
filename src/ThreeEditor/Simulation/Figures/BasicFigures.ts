import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationMesh } from '../Base/SimulationMesh';
import { AdditionalGeometryDataType } from '../../../util/AdditionalGeometryData';

const defaultMaterial = new THREE.MeshBasicMaterial({
	color: 0x000000,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

export const BASIC_GEOMETRY_OPTIONS = {
	BoxGeometry: 'BoxGeometry',
	CylinderGeometry: 'CylinderGeometry',
	SphereGeometry: 'SphereGeometry',
	HollowCylinderGeometry: 'HollowCylinderGeometry'
} as const;

export type BasicGeometry = (typeof BASIC_GEOMETRY_OPTIONS)[keyof typeof BASIC_GEOMETRY_OPTIONS];

export abstract class BasicFigure<
	TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry
> extends SimulationMesh<TGeometry> {
	geometryType: BasicGeometry;
	readonly isBasicFigure: true = true;
	constructor(
		editor: YaptideEditor,
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
export class BoxFigure extends BasicFigure<THREE.BoxGeometry> {
	constructor(
		editor: YaptideEditor,
		geometry?: THREE.BoxGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(editor, 'Box', 'BoxFigure', 'BoxGeometry', geometry ?? boxGeometry, material);
	}
	reconstructGeometryFromData(data: AdditionalGeometryDataType): void {
		if (data.geometryType !== this.geometryType) throw new Error('Geometry type mismatch');
		const {
			parameters: { width, height, depth }
		} = data;
		this.geometry = new THREE.BoxGeometry(width as number, height as number, depth as number);
	}
}

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2).rotateX(
	Math.PI / 2
) as THREE.CylinderGeometry;

export class CylinderFigure extends BasicFigure<THREE.CylinderGeometry> {
	constructor(
		editor: YaptideEditor,
		geometry?: THREE.CylinderGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(
			editor,
			'Cylinder',
			'CylinderFigure',
			'CylinderGeometry',
			geometry ?? cylinderGeometry,
			material
		);
	}
	reconstructGeometryFromData(data: AdditionalGeometryDataType): void {
		if (data.geometryType !== this.geometryType) throw new Error('Geometry type mismatch');
		const {
			parameters: { depth, radius }
		} = data;
		this.geometry = new THREE.CylinderGeometry(
			radius as number,
			radius as number,
			depth as number
		);
	}
}

const sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

export class SphereFigure extends BasicFigure<THREE.SphereGeometry> {
	readonly notRotatable = true;
	constructor(
		editor: YaptideEditor,
		geometry?: THREE.SphereGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(
			editor,
			'Sphere',
			'SphereFigure',
			'SphereGeometry',
			geometry ?? sphereGeometry,
			material
		);
	}
	reconstructGeometryFromData(data: AdditionalGeometryDataType): void {
		if (data.geometryType !== this.geometryType) throw new Error('Geometry type mismatch');
		const {
			parameters: { radius }
		} = data;
		this.geometry = new THREE.SphereGeometry(radius as number);
	}
}

export const isBasicFigure = (x: unknown): x is BasicFigure => x instanceof BasicFigure;

export const isBoxFigure = (x: unknown): x is BoxFigure => x instanceof BoxFigure;

export const isCylinderFigure = (x: unknown): x is CylinderFigure => x instanceof CylinderFigure;

export const isSphereFigure = (x: unknown): x is SphereFigure => x instanceof SphereFigure;
