import * as THREE from 'three';

import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationContainer';

export type SimulationElementJSON = {
	name: string;
	type: string;
	uuid: string;
};

/**
 * This is the base class for all simulation elements.
 * It is a THREE.Object3D only for integration purposes.
 * Even elements that are not represented by a mesh or position in a space
 * should inherit from this class.
 */
export abstract class SimulationElement
	extends THREE.Object3D
	implements
		SimulationPropertiesType,
		SimulationSceneChild,
		SerializableState<SimulationElementJSON>
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

	toSerialized(): SimulationElementJSON {
		const { name, type, uuid } = this;

		return {
			name,
			type,
			uuid
		};
	}

	fromSerialized(json: SimulationElementJSON): this {
		this.name = json.name;
		this.uuid = json.uuid;

		return this;
	}

	reset() {
		this.name = this._name;
	}

	duplicate() {
		return super.clone() as SimulationElement;
	}
}

export function isSimulationElement(obj: unknown): obj is SimulationElement {
	return (obj as SimulationElement).isSimulationElement === true;
}
