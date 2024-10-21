import * as THREE from 'three';

import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';
import { SimulationElement, SimulationElementJSON } from './SimulationElement';
import { SimulationMeshJSON } from './SimulationMesh';

export type SimulationPointsJSON = Omit<
	SimulationElementJSON & Omit<SimulationMeshJSON, 'geometryData'>,
	never
>;
/**
 * This is the base class for elements that are represented by grid of points.
 *
 * Compared to {@link SimulationMesh}, this class has two geometries:
 *
 * - one for points with color and toggleable visibility
 * - one for wireframe visualization when object is selected.
 *
 * wireframe visualization is done by {@link SimulationPoints.wireframeHelper}
 */
export abstract class SimulationPoints
	extends THREE.Points
	implements SimulationPropertiesType, SimulationSceneChild, SimulationElement
{
	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	declare material: THREE.PointsMaterial;
	abstract wireframeHelper: THREE.Mesh;
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
							scope.wireframeHelper.position.copy(nV);

							return nV;
						};

					return Reflect.get(target, p);
				default:
					return Reflect.get(target, p);
			}
		}
	});

	protected overrideHandler: ProxyHandler<SimulationPoints> = {
		get: (target: SimulationPoints, p: keyof SimulationPoints) => {
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

	toJSON(): SimulationPointsJSON {
		const { name, type, uuid, visible } = this;
		const colorHex = this.material.color.getHex();

		return {
			name,
			type,
			uuid,
			visible,
			colorHex
		};
	}

	fromJSON(json: SimulationPointsJSON) {
		const { name, uuid, visible, colorHex } = json;
		this.name = name;
		this.uuid = uuid;
		this.visible = visible;
		this.material.color.setHex(colorHex);

		return this;
	}

	reset() {
		this.name = this._name;
		this.visible = true;
		this.material.color.setHex(this._colorHex);
	}

	copy(source: this, recursive = true) {
		return new Proxy<SimulationPoints>(
			super.copy(source, recursive),
			this.overrideHandler
		) as this;
	}

	abstract duplicate(): SimulationPoints;
}

export function isSimulationPoints(x: unknown): x is SimulationPoints {
	return x instanceof SimulationPoints;
}
