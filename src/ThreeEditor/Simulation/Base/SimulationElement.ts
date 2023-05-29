import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';

/**
 * This is the base class for all simulation elements.
 * It is a THREE.Object3D only for integration purposes.
 * Even elements that are not represented by a mesh or position in a space should inherit from this class.
 */
export abstract class SimulationElement
	extends THREE.Object3D
	implements SimulationPropertiesType, SimulationSceneChild
{
	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	readonly type: string;
	readonly isSimulationElement = true;
	_name: string;

	constructor(editor: YaptideEditor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = this._name = name ?? type;
		this.type = type;
	}
}
