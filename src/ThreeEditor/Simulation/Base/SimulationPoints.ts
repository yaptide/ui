import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';
import { SimulationElement, SimulationElementJSON } from './SimulationElement';
import { SimulationMeshJSON } from './SimulationMesh';
import { getGeometryParameters } from '../../../util/AdditionalGeometryData';

/**
 * This is the base class for detectors that are represented by points.
 */

export type SimulationPointsJSON<GeometryDataType> = Omit<
	SimulationElementJSON &
		Omit<SimulationMeshJSON, 'geometryData'> & {
			geometryData: GeometryDataType;
		},
	never
>;

export abstract class SimulationPoints<GeometryDataType = unknown>
	extends THREE.Points
	implements SimulationPropertiesType, SimulationSceneChild, SimulationElement
{
	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	material!: THREE.PointsMaterial;
	readonly type: string;
	readonly isSimulationElement = true;
	readonly isSimulationPoints = true;
	_name: string;
	_colorHex: number;

	protected positionProxy: THREE.Vector3 = new Proxy(this.position, {
		get: (target: THREE.Vector3, p: keyof THREE.Vector3) => {
			const scope = this;
			const parent: SimulationSceneContainer<SimulationPoints> | undefined = this.parent
				?.parent as SimulationSceneContainer<SimulationPoints> | undefined;
			switch (p) {
				case 'copy':
					return function (v: THREE.Vector3) {
						target[p].apply(target, [v]);
						return scope.positionProxy;
					};
				case 'add':
					if (parent)
						return function (v: THREE.Vector3) {
							const nV = target[p].apply(target, [v]);
							scope.pointsHelper.position.copy(nV);
							return nV;
						};
					return Reflect.get(target, p);
				default:
					return Reflect.get(target, p);
			}
		}
	});

	protected overrideHandler: ProxyHandler<SimulationPoints<GeometryDataType>> = {
		get: (
			target: SimulationPoints<GeometryDataType>,
			p: keyof SimulationPoints<GeometryDataType>
		) => {
			let result: any;
			switch (p) {
				case 'position':
					result = this.positionProxy;
					break;
				default:
					result = Reflect.get(target, p);
			}
			return result;
		},
		set: (
			target: SimulationPoints,
			p: keyof SimulationPoints,
			value: unknown,
			receiver: unknown
		) => {
			const result = Reflect.set(target, p, value, receiver);
			switch (p) {
				case 'geometry':
					this.geometry.computeBoundingSphere();
					this.updateMatrixWorld(true);
					break;
				default:
					break;
			}
			return result;
		}
	};

	constructor(
		editor: YaptideEditor,
		name: string | undefined,
		type: string,
		material: THREE.PointsMaterial
	) {
		super();
		this.material = material;
		this.editor = editor;
		this.name = this._name = name ?? type;
		this._colorHex = this.material.color.getHex();
		this.type = type;
	}
	abstract pointsHelper: THREE.Mesh;
	toJSON(): SimulationPointsJSON<GeometryDataType> {
		const { name, type, uuid, visible } = this;
		const colorHex = this.material.color.getHex();
		return {
			name,
			type,
			uuid,
			visible,
			colorHex
		} as SimulationPointsJSON<GeometryDataType>;
	}
	fromJSON(json: SimulationPointsJSON<GeometryDataType>) {
		const { name, uuid, visible, colorHex, geometryData } = json;
		this.name = name;
		this.uuid = uuid;
		this.visible = visible;
		this.material.color.setHex(colorHex);
		// this.geometryData = geometryData;
		return this;
	}

	reset() {
		this.name = this._name;
		this.visible = true;
		this.material.color.setHex(this._colorHex);
	}

	copy(source: this, recursive = true) {
		return new Proxy<SimulationPoints<GeometryDataType>>(
			super.copy(source, recursive),
			this.overrideHandler
		) as this;
	}
}

export function isSimulationPoints(x: unknown): x is SimulationPoints {
	return x instanceof SimulationPoints;
}
