import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { ISimulationSceneChild, SimulationSceneContainer } from './SimScene';
import { SimulationPropertiesType } from '../../../types/SimProperties';

/**
 * This is the base class for all simulation objects that have a basic mesh.
 */
export abstract class SimulationMesh<
		TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
		TMaterial extends THREE.Material = THREE.MeshBasicMaterial
	>
	extends THREE.Mesh<TGeometry, TMaterial>
	implements SimulationPropertiesType, ISimulationSceneChild
{
	editor: Editor;
	parent: SimulationSceneContainer<this> | null = null;
	readonly type: string;

	constructor(
		editor: Editor,
		name: string | undefined,
		type: string,
		geometry?: TGeometry,
		material?: TMaterial
	) {
		super(geometry, material);
		this.editor = editor;
		this.name = name ?? type;
		this.type = type;
		this.parent = null;
	}
}
