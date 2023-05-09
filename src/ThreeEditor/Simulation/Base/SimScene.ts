import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { SimulationPropertiesType } from '../../../types/SimProperties';
import { getNextFreeName } from '../../util/Name';

export interface ISimulationSceneChild extends THREE.Object3D {
	parent: SimulationSceneContainer<this> | null;
	name: string;
	type: string;
	readonly id: number;
	uuid: string;
}

export abstract class SimulationSceneContainer<TChild extends ISimulationSceneChild>
	extends THREE.Object3D
	implements SimulationPropertiesType
{
	children: TChild[];
	editor: Editor;
	private _name: string;
	parent: SimulationSceneContainer<this> | null;
	type: string;
	constructor(editor: Editor, name: string, type: string) {
		super();
		this.name = this._name = name;
		this.type = type;
		this.editor = editor;
		this.children = [];
		this.parent = null;
	}
	reset() {
		this.name = this._name;
		this.children.forEach(child => {
			child.parent = null;
		});
		this.children.length = 0;
	}
	toJSON(): unknown {
		return this.children.map(child => child.toJSON());
	}
}
