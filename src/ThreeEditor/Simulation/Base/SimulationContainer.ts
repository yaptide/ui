import * as THREE from 'three';

import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { getNextFreeName, UniqueChildrenNames } from '../../../util/Name/Name';
import { YaptideEditor } from '../../js/YaptideEditor';

/**
 * Interface that narrows down the type for the parent of Object3D
 * to container for objects of the same type.
 */
export interface SimulationSceneChild extends THREE.Object3D {
	parent: SimulationSceneContainer<this> | null;
}

/**
 * This is the base class for objects storing simulation elements of the same type.
 *
 * Implements {@link UniqueChildrenNames} system for unique names for the children.
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
	readonly isSimulationElement = true;
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
		this.clear();
	}

	toJSON(): ReturnType<TChild['toJSON']>[] {
		return this.children.map(child => child.toJSON());
	}

	fromJSON(json: ReturnType<TChild['toJSON']>[]) {
		this.reset();

		if (!Array.isArray(json)) throw new Error(`Expected array, got ${typeof json}`);
		json.forEach(childJson => {
			const child = this._loader(childJson);
			this.add(child);
		});
	}

	abstract duplicate(): SimulationSceneContainer<TChild>;
}

/**
 * Variant of SimulationSceneContainer that can only have one child.
 * @see {@link SimulationSceneContainer}
 */
export class OneSlotContainer<TChild extends SimulationSceneChild>
	extends SimulationSceneContainer<TChild>
	implements UniqueChildrenNames
{
	add(child: TChild): this {
		if (this.children.length > 0) {
			throw new Error('OneSlotContainer can only have one child');
		}

		return super.add(child);
	}

	// eslint-disable-next-line class-methods-use-this
	duplicate(): SimulationSceneContainer<TChild> {
		throw new Error('Method not implemented.');
	}
}

/**
 * Type guard for {@link SimulationSceneContainer}
 */
export function isSimulationSceneContainer(object: unknown): object is SimulationSceneContainer {
	return (object as SimulationSceneContainer).isSimulationContainer === true;
}
