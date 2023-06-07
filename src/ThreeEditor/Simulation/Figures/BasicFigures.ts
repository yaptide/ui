import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationMesh } from '../Base/SimulationMesh';
import { AdditionalGeometryDataType } from '../../../util/AdditionalGeometryData';
import { HollowCylinderGeometry } from '../Base/HollowCylinderGeometry';

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

export type BoxParameters = {
	width: number;
	height: number;
	depth: number;
};

export type CylinderParameters = {
	depth: number;
	outerRadius: number;
	innerRadius: number;
};

export type SphereParameters = {
	radius: number;
};

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

const boxGeometry = new THREE.BoxGeometry();
export class BoxFigure extends BasicFigure<THREE.BoxGeometry> {
	constructor(
		editor: YaptideEditor,
		geometry?: THREE.BoxGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(editor, 'Box', 'BoxFigure', 'BoxGeometry', geometry ?? boxGeometry, material);
	}
	reconstructGeometryFromData(data: AdditionalGeometryDataType<BoxParameters>): void {
		if (data.geometryType !== this.geometryType) throw new Error('Geometry type mismatch');
		const {
			parameters: { width, height, depth }
		} = data;
		this.geometry = new THREE.BoxGeometry(width as number, height as number, depth as number);
	}
}

const cylinderGeometry = new HollowCylinderGeometry();

export class CylinderFigure extends BasicFigure<HollowCylinderGeometry> {
	constructor(
		editor: YaptideEditor,
		geometry?: HollowCylinderGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(
			editor,
			'Cylinder',
			'CylinderFigure',
			'HollowCylinderGeometry',
			geometry ?? cylinderGeometry,
			material
		);
	}
	reconstructGeometryFromData(data: AdditionalGeometryDataType<CylinderParameters>): void {
		if (data.geometryType !== this.geometryType) throw new Error('Geometry type mismatch');
		const {
			parameters: { depth, outerRadius, innerRadius }
		} = data;
		this.geometry = new HollowCylinderGeometry(
			innerRadius as number,
			outerRadius as number,
			depth as number
		);
	}
}

const sphereGeometry = new THREE.SphereGeometry();

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
	reconstructGeometryFromData(data: AdditionalGeometryDataType<SphereParameters>): void {
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
