import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';
import { SimulationElement } from './SimulationElement';
import { SimulationMeshJSON } from './SimulationMesh';
import { AdditionalGeometryDataType, getGeometryData } from '../../../util/AdditionalGeometryData';

/**
 * This is the base class for detectors that are represented by points.
 */
export abstract class SimulationPoints
	extends THREE.Points
	implements SimulationPropertiesType, SimulationSceneChild, SimulationElement
{
	private static _detectPointsMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
		color: new THREE.Color('cyan'),
		size: 0.1
	});

	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	material: THREE.PointsMaterial = SimulationPoints._detectPointsMaterial.clone();
	readonly type: string;
	readonly isSimulationElement = true;
	_name: string;

	constructor(editor: YaptideEditor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = this._name = name ?? type;
		this.type = type;
	}
	toJSON(): SimulationMeshJSON {
		const { name, type, uuid, visible } = this;
		const geometryData = getGeometryData(this);
		const colorHex = this.material.color.getHex();
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
		throw new Error('Method not implemented.');
	}
	abstract reconstructGeometryFromData(data: AdditionalGeometryDataType): void;
}
