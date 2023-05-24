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
	// TODO: Make it work for all SimulationSceneContainers.
	// toJSON(): Array<ReturnType<TChild['toJSON']>> {
	toJSON(): Object {
		return this.children.map(child => child.toJSON());
	}
}

export class SingletonContainer<TChild extends SimulationSceneChild>
	extends SimulationSceneContainer<TChild>
	implements UniqueChildrenNames
{
	readonly isSingletonContainer: true = true;
	add(child: TChild): this {
		if (this.children.length > 0) {
			this.children.forEach(child => {
				this.remove(child);
			});
		}
		return super.add(child);
	}
}

type ChildMethods<
	ChildName extends string,
	Prefix extends string = '',
	Suffix extends string = ''
> = `${Prefix}${'' extends Prefix ? ChildName : Capitalize<ChildName>}${Capitalize<Suffix>}`;

type ChildMethodsManage<ChildName extends string> = ChildMethods<ChildName, 'add' | 'remove'>;

type ChildMethodsCreate<ChildName extends string> = ChildMethods<ChildName, 'create'>;

type ChildMethodsGet<ChildName extends string> = ChildMethods<
	ChildName,
	'get',
	'byUuid' | 'byName'
>;

type ChildPropertiesContainer<ChildName extends string> = ChildMethods<ChildName, '', 'container'>;

export type SimulationElementManager<TName extends string, TChild extends SimulationSceneChild> = {
	[Method in ChildMethodsManage<TName>]: (child: TChild) => void;
} & {
	[Method in ChildMethodsCreate<TName>]: () => TChild;
} & {
	[Method in ChildMethodsGet<TName>]: (value: string) => TChild | null;
} & {
	[Property in ChildPropertiesContainer<TName>]: SimulationSceneContainer<TChild>;
};
