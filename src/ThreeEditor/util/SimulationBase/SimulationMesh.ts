import * as THREE from 'three';
import { MathUtils } from 'three';
import { Editor } from '../../js/Editor';
import {
	ISimulationChild,
	ISimulationSceneChild,
	SimulationDataGroup,
	SimulationSceneGroup
} from './SimulationGroup';
import { ISimulationObject } from './SimulationObject';

export abstract class SimulationMesh<
		TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
		TMaterial extends THREE.Material = THREE.Material
	>
	extends THREE.Mesh<TGeometry, TMaterial>
	implements ISimulationObject, ISimulationSceneChild
{
	editor: Editor;
	parent: SimulationSceneGroup<this> | null = null;

	constructor(
		editor: Editor,
		name: string | undefined,
		type: string,
		geometry?: TGeometry,
		material?: TMaterial
	) {
		super(geometry, material);
		this.editor = editor;
		this.name = name ?? `${type}${this.id}`;
		this.type = type;
		this.parent = null;
	}
}

export abstract class SimulationPoints
	extends THREE.Points
	implements ISimulationObject, ISimulationSceneChild
{
	editor: Editor;
	parent: SimulationSceneGroup<this> | null = null;

	constructor(editor: Editor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = name ?? `Detect${this.id}`;
		this.parent = null;
	}
}

export abstract class SimulationData implements ISimulationChild {
	private editor: Editor;

	parent: SimulationDataGroup<this> | null;
	name: string;
	type: string;
	uuid: string;

	constructor(editor: Editor, name: string | undefined, type: string) {
		this.editor = editor;
		this.name = name ?? type;
		this.type = type;
		this.parent = null;
		this.uuid = MathUtils.generateUUID();
	}
	abstract toJSON(): unknown;
}
