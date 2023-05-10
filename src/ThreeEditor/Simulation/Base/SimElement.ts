import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { SimulationPropertiesType } from '../../../types/SimProperties';
import { ISimulationSceneChild, SimulationSceneContainer } from './SimScene';

export abstract class SimulationElement
	extends THREE.Object3D
	implements SimulationPropertiesType, ISimulationSceneChild
{
	editor: Editor;
	parent: SimulationSceneContainer<this> | null = null;
	readonly type: string;

	constructor(editor: Editor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = name ?? type;
		this.type = type;
	}
}
