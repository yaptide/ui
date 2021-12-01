import * as THREE from 'three';
import { MathUtils } from 'three';
import { Editor } from '../../js/Editor';
import { ISimulationObject } from './SimulationObject';

export interface ISimulationSceneChild extends THREE.Object3D {
	parent: SimulationSceneGroup<this> | null;
	name: string;
	type: string;
	readonly id: number;
	uuid: string;
}

export interface ISimulationChild {
	parent: SimulationDataGroup<this> | null;

	toJSON: () => unknown;
}

export abstract class SimulationSceneGroup<TChild extends ISimulationSceneChild>
	extends THREE.Object3D
	implements ISimulationObject
{
	children: TChild[];
	editor: Editor;
	private _name: string;
	type: string;
	constructor(editor: Editor, name: string, type: string) {
		super();
		this.name = this._name = name;
		this.type = type;
		this.editor = editor;
		this.children = [];
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

export abstract class SimulationDataGroup<TChild extends ISimulationChild> {
	children: TChild[] = [];
	editor: Editor;
	name: string;
	uuid: string;
	private _name: string;
	type: string;
	constructor(editor: Editor, name: string, type: string) {
		this.name = this._name = name;
		this.type = type;
		this.editor = editor;
		this.uuid = MathUtils.generateUUID();
	}
	reset() {
		this.name = this._name;
		this.children.forEach(child => {
			child.parent = null;
		});
		this.children = [];
	}
	add(...object: TChild[]): this {
		object.forEach(obj => {
			obj.parent = this;
			this.children.push(obj);
		});
		return this;
	}
	remove(...object: TChild[]): this {
		object.forEach(obj => {
			obj.parent = null;
			this.children.splice(this.children.indexOf(obj), 1);
		});
		return this;
	}
	clear(): this {
		this.children.forEach(child => {
			child.parent = null;
		});
		this.children = [];
		return this;
	}
	getObjectByProperty(name: keyof TChild, value: unknown): TChild | undefined {
		return this.children.find(child => child[name] === value);
	}
	toJSON(): unknown {
		return this.children.map(child => child.toJSON());
	}
}
