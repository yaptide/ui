import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { UniqueChildrenNames, getNextFreeName } from '../../../util/Name/Name';
import { YaptideEditor } from '../../js/YaptideEditor';

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
export abstract class SimulationSceneContainer<
		TChild extends SimulationSceneChild = SimulationSceneChild
	>
	extends THREE.Group
	implements SimulationSceneChild, SimulationPropertiesType, UniqueChildrenNames
{
	editor: YaptideEditor;
	parent: SimulationSceneContainer<this> | null = null;
	children: TChild[] = [];
	readonly type: string;
	readonly isSimulationContainer = true;
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner: boolean = true;
	_name: string;
	private _loader: (json: ReturnType<TChild['toJSON']>) => TChild;

	uniqueNameForChild(child: TChild, newName?: string): string {
		return getNextFreeName(this, newName ?? child.name, child);
	}

	add(child: TChild): this {
		child.name = this.uniqueNameForChild(child);
		return super.add(child);
	}

	constructor(
		editor: YaptideEditor,
		name: string | undefined,
		type: string,
		loader: (json: ReturnType<TChild['toJSON']>) => TChild
	) {
		super();
		this.editor = editor;
		this.name = this._name = name ?? type;
		this.type = type;
		this._loader = loader;
	}

	reset() {
		this.name = this._name;
		this.children.forEach(child => {
			child.parent = null;
		});
		this.children.length = 0;
	}

	toJSON(): ReturnType<TChild['toJSON']>[] {
		return this.children.map(child => child.toJSON());
	}

	fromJSON(json: ReturnType<TChild['toJSON']>[]) {
		this.reset();
		json.forEach(json => {
			const child = this._loader(json);
			this.add(child);
		});
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

export function isSimulationSceneContainer(object: unknown): object is SimulationSceneContainer {
	return (object as SimulationSceneContainer).isSimulationContainer === true;
}
