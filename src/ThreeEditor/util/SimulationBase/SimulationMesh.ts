import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { ISimulationSceneChild, SimulationSceneGroup } from './SimulationGroup';
import { ISimulationObject } from './SimulationObject';

export abstract class SimulationMesh<
		TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
		TMaterial extends THREE.Material = THREE.MeshBasicMaterial
	>
	extends THREE.Mesh<TGeometry, TMaterial>
	implements ISimulationObject, ISimulationSceneChild
{
	editor: Editor;
	parent: SimulationSceneGroup<this> | null = null;
	readonly type: string;

	constructor(
		editor: Editor,
		name: string | undefined,
		type: string,
		geometry?: TGeometry,
		material?: TMaterial
	) {
		super(geometry, material);
		this.editor = editor;
		this.name = name ?? type;
		this.type = type;
		this.parent = null;
	}
}

export abstract class SimulationObject3D
	extends THREE.Object3D
	implements ISimulationObject, ISimulationSceneChild
{
	editor: Editor;
	parent: SimulationSceneGroup<this> | null = null;
	readonly notVisibleChildren?: boolean = undefined;
	readonly notDraggable?: boolean = undefined;
	readonly notHidable?: boolean = undefined;
	readonly type: string;

	constructor(editor: Editor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = name ?? type;
		this.type = type;
		this.parent = null;
	}
}

export abstract class SimulationPoints
	extends THREE.Points
	implements ISimulationObject, ISimulationSceneChild
{
	private static _detectPointsMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
		color: new THREE.Color('cyan'),
		size: 0.1
	});

	editor: Editor;
	parent: SimulationSceneGroup<this> | null = null;
	material: THREE.PointsMaterial;
	readonly type: string;

	constructor(editor: Editor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = name ?? `Detect`;
		this.type = type;
		this.parent = null;
		this.material = SimulationPoints._detectPointsMaterial.clone();
	}
}
