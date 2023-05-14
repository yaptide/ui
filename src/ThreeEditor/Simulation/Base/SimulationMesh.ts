import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationScene';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationElement } from './SimulationElement';

/**
 * This is the base class for all simulation objects that have a basic mesh.
 */
export abstract class SimulationMesh<
		TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
		TMaterial extends THREE.Material = THREE.MeshBasicMaterial
	>
	extends THREE.Mesh<TGeometry, TMaterial>
	implements SimulationPropertiesType, SimulationSceneChild, SimulationElement
{
	editor: Editor;
	parent: SimulationSceneContainer<this> | null = null;
	_name: string;
	readonly type: string;
	readonly isSimulationElement = true;

	constructor(
		editor: Editor,
		name: string | undefined,
		type: string,
		geometry?: TGeometry,
		material?: TMaterial
	) {
		super(geometry, material);
		this.editor = editor;
		this.name = this._name = name ?? type;
		this.type = type;
		this.parent = null;
	}
}
