import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { ISimulationObject } from './SimulationObject';

export interface ISimulationSceneChild extends THREE.Object3D {
	parent: SimulationSceneGroup<this> | null;
	name: string;
	type: string;
	readonly id: number;
	uuid: string;
}

export abstract class SimulationSceneGroup<TChild extends ISimulationSceneChild>
	extends THREE.Object3D
	implements ISimulationObject
{
	children: TChild[];
	editor: Editor;
	private _name: string;
	parent: SimulationSceneGroup<this> | null;
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
		this.children = [];
	}
	toJSON(): unknown {
		return this.children.map(child => child.toJSON());
	}
}
