import * as THREE from 'three';

import { AdditionalGeometryDataType } from '../../../util/AdditionalGeometryData';
import { YaptideEditor } from '../../js/YaptideEditor';
import { HollowCylinderGeometry } from '../Base/HollowCylinderGeometry';
import { SimulationMesh, SimulationMeshJSON } from '../Base/SimulationMesh';
import { DEFAULT_SIMULATION_MATERIAL, MATERIALS } from '../Materials/materials';

const defaultMaterial = new THREE.MeshBasicMaterial({
	color: 0x000000,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

export const BASIC_GEOMETRY_OPTIONS = {
	BoxGeometry: 'BoxGeometry',
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
	radius: number;
	innerRadius: number;
};

export type SphereParameters = {
	radius: number;
};

/**
 * This is the base class for all objects defined by specific geometry definition located in the point in simulation space.
 *
 * Type of geometry can be one of the following:
 * @template BoxGeometry - defined with THREE.BoxGeometry class
 * @template SphereGeometry - defined with THREE.SphereGeometry class
 * @template HollowCylinderGeometry - defined with custom HollowCylinderGeometry class
 * @see {HollowCylinderGeometry}
 */
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

	reconstructGeometryFromData(data: AdditionalGeometryDataType): void {
		if (data.geometryType !== this.geometryType) throw new Error('Geometry type mismatch');
		const { position, rotation } = data;
		this.position.fromArray(position);
		//From deg to rad
		this.rotation.fromArray([
			...rotation.slice(0, 3).map(v => (v as number) * THREE.MathUtils.DEG2RAD),
			undefined
		] as [number, number, number, undefined]);
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
		super.reconstructGeometryFromData(data);
		const {
			parameters: { width, height, depth }
		} = data;
		this.geometry = new THREE.BoxGeometry(width as number, height as number, depth as number);
	}
}

const cylinderGeometry = new HollowCylinderGeometry(0, 1, 1, 32, 2, 2);

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
		super.reconstructGeometryFromData(data);
		const {
			parameters: { depth, radius, innerRadius }
		} = data;

		this.geometry = new HollowCylinderGeometry(
			innerRadius as number,
			radius as number,
			depth as number,
			32,
			2,
			2
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
		super.reconstructGeometryFromData(data);
		const {
			parameters: { radius }
		} = data;
		this.geometry = new THREE.SphereGeometry(radius as number);
	}
}

function serializeSimulationMaterial(material: SimulationMaterialType) {
	if (!material) {
		return {
			icru: -1,
			name: 'UNKNOWN',
			sanitized_name: 'unknown',
			density: 0,
			geant_name: 'unknown'
		};
	}

	const { icru, name, density } = material;
	const sanitized_name = (material as any).sanitized_name ?? (material as any).sanitizedName;
	const geant_name = (material as any).geant_name ?? 'G4_' + sanitized_name;

	// console.log(icru, name, sanitized_name, density, geant_name);

	return { icru, name, sanitized_name, density, geant_name };
}

function deserializeSimulationMaterial(
	serialized: SerializedSimulationMaterial
): SimulationMaterialType {
	const match = MATERIALS.find(mat => mat.icru === serialized.icru);

	if (!match) {
		throw new Error(`Unknown material icru: ${serialized.icru}`);
	}

	return match;
}

export type SimulationMaterialType = (typeof MATERIALS)[number];

export type SerializedSimulationMaterial = {
	icru: number;
	name: string;
	sanitized_name: string;
	density: number;
	geant_name: string;
};

export interface GeantFigureJSON extends SimulationMeshJSON {
	simulationMaterial: SerializedSimulationMaterial;
}

export class BoxGeant extends BoxFigure {
	simulationMaterial: SimulationMaterialType;

	constructor(
		editor: YaptideEditor,
		geometry?: THREE.BoxGeometry,
		material?: THREE.MeshBasicMaterial,
		simulationMaterial: SimulationMaterialType = DEFAULT_SIMULATION_MATERIAL
	) {
		super(editor, geometry, material);
		this.simulationMaterial = simulationMaterial;
	}

	override toSerialized(): GeantFigureJSON {
		console.log(this.simulationMaterial);

		const json: GeantFigureJSON = {
			...super.toSerialized(),
			simulationMaterial: serializeSimulationMaterial(this.simulationMaterial)
		};

		return json;
	}

	override fromSerialized(json: GeantFigureJSON): this {
		super.fromSerialized(json);
		this.simulationMaterial = deserializeSimulationMaterial(json.simulationMaterial);

		return this;
	}
}

export class CylinderGeant extends CylinderFigure {
	simulationMaterial: SimulationMaterialType;

	constructor(
		editor: YaptideEditor,
		geometry?: HollowCylinderGeometry,
		material?: THREE.MeshBasicMaterial,
		simulationMaterial: SimulationMaterialType = DEFAULT_SIMULATION_MATERIAL
	) {
		super(editor, geometry, material);
		this.simulationMaterial = simulationMaterial;
	}

	override toSerialized(): GeantFigureJSON {
		const json: GeantFigureJSON = {
			...super.toSerialized(),
			simulationMaterial: serializeSimulationMaterial(this.simulationMaterial)
		};

		return json;
	}

	override fromSerialized(json: GeantFigureJSON): this {
		super.fromSerialized(json);
		this.simulationMaterial = deserializeSimulationMaterial(json.simulationMaterial);

		return this;
	}
}

export class SphereGeant extends SphereFigure {
	simulationMaterial: SimulationMaterialType;

	constructor(
		editor: YaptideEditor,
		geometry?: THREE.SphereGeometry,
		material?: THREE.MeshBasicMaterial,
		simulationMaterial: SimulationMaterialType = DEFAULT_SIMULATION_MATERIAL
	) {
		super(editor, geometry, material);
		this.simulationMaterial = simulationMaterial;
	}

	override toSerialized(): GeantFigureJSON {
		const json: GeantFigureJSON = {
			...super.toSerialized(),
			simulationMaterial: serializeSimulationMaterial(this.simulationMaterial)
		};

		return json;
	}

	override fromSerialized(json: GeantFigureJSON): this {
		super.fromSerialized(json);
		this.simulationMaterial = deserializeSimulationMaterial(json.simulationMaterial);

		return this;
	}
}

export const isGeantFigure = (x: unknown): x is BoxGeant | CylinderGeant | SphereGeant =>
	x instanceof BoxGeant || x instanceof CylinderGeant || x instanceof SphereGeant;

export const isBasicFigure = (x: unknown): x is BasicFigure => x instanceof BasicFigure;

export const isBoxFigure = (x: unknown): x is BoxFigure => x instanceof BoxFigure;

export const isCylinderFigure = (x: unknown): x is CylinderFigure => x instanceof CylinderFigure;

export const isSphereFigure = (x: unknown): x is SphereFigure => x instanceof SphereFigure;
