import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { Editor } from '../../js/Editor';
import { UniqueChildrenNames, getNextFreeName } from '../../../util/Name/Name';
import { SimulationElement } from './SimulationElement';

export interface SimulationSceneChild extends THREE.Object3D {
	parent: SimulationSceneContainer<this> | null;
	name: string;
	type: string;
	readonly id: number;
	uuid: string;
}

/**
 * This is the base class for groups of simulation elements.
 */
export abstract class SimulationSceneContainer<TChild extends SimulationSceneChild>
	extends SimulationElement
	implements SimulationPropertiesType, UniqueChildrenNames
{
	children: TChild[];
	parent: SimulationSceneContainer<this> | null;
	getNextFreeName(child: TChild, newName?: string): string {
		return getNextFreeName(this, newName ?? child.name, child);
	}
	add(child: TChild): this {
		child.name = this.getNextFreeName(child);
		return super.add(child);
	}
	constructor(editor: Editor, name: string, type: string) {
		super(editor, name, type);
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
	// toJSON(): Array<ReturnType<TChild['toJSON']>> { TODO: Make it work for all SimulationSceneContainers.
	toJSON(): Object {
		return this.children.map(child => child.toJSON());
	}
}
