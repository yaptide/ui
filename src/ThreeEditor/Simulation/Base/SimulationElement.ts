import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { SimulationPropertiesType } from '../../../types/SimProperties';
import { ISimulationSceneChild, SimulationSceneContainer } from './SimulationScene';

/**
 * This is the base class for all simulation elements.
 * It is a THREE.Object3D only for integration purposes.
 * Even elements that are not represented by a mesh or position in a space should inherit from this class.
 */
export abstract class SimulationElement
	extends THREE.Object3D
	implements SimulationPropertiesType, ISimulationSceneChild
{
	editor: Editor;
	parent: SimulationSceneContainer<this> | null = null;
	readonly type: string;
	readonly isSimulationElement = true;
	_name: string;

	constructor(editor: Editor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = this._name = name ?? type;
		this.type = type;
	}
}
