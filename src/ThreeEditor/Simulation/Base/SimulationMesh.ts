import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationElement, SimulationElementJSON } from './SimulationElement';
import { AdditionalGeometryDataType, getGeometryData } from '../../../util/AdditionalGeometryData';

export type SimulationMeshJSON = Omit<
	SimulationElementJSON & {
		geometryData: AdditionalGeometryDataType;
		colorHex: number;
		visible: boolean;
	},
	never
>;

/**
 * This is the base class for all simulation objects
 * that displayable elements on a scene.
 *
 * All classes that inherit from this will have toggleable visibility
 * and configurable color.
 */
export abstract class SimulationMesh<
		TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
		TMaterial extends THREE.MeshBasicMaterial = THREE.MeshBasicMaterial
	>
	extends THREE.Mesh<TGeometry, TMaterial>
	implements SimulationPropertiesType, SimulationSceneChild, SimulationElement
{
	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	_name: string;
	readonly type: string;
	readonly isSimulationElement = true;

	constructor(
		editor: YaptideEditor,
		name: string | undefined,
		type: string,
		geometry?: TGeometry,
		material?: TMaterial
	) {
		super(geometry, material);
		this.editor = editor;
		this.name = this._name = name ?? type;
		this.type = type;
	}
	toJSON(): SimulationMeshJSON {
		const { name, type, uuid, visible } = this;
		const geometryData = getGeometryData(this);
		const colorHex = (this.material as THREE.MeshBasicMaterial).color.getHex();
		return {
			name,
			type,
			uuid,
			visible,
			geometryData,
			colorHex
		};
	}
	fromJSON(json: SimulationMeshJSON) {
		this.name = json.name;
		this.uuid = json.uuid;
		this.visible = json.visible;
		this.material.color.setHex(json.colorHex);
		this.reconstructGeometryFromData(json.geometryData);
		return this;
	}
	reset(): void {
		this.name = this._name;
	}
	abstract reconstructGeometryFromData(data: AdditionalGeometryDataType): void;
}

export function isSimulationMesh(x: unknown): x is SimulationMesh {
	return x instanceof SimulationMesh;
}
