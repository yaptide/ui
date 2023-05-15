import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { SimulationSceneChild, SimulationSceneContainer } from './SimulationScene';
import { SimulationElement } from './SimulationElement';

/**
 * This is the base class for detectors that are represented by points.
 */
export abstract class SimulationPoints
	extends THREE.Points
	implements SimulationPropertiesType, SimulationSceneChild, SimulationElement
{
	private static _detectPointsMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
		color: new THREE.Color('cyan'),
		size: 0.1
	});

	editor: Editor;
	parent: SimulationSceneContainer<this> | null = null;
	material: THREE.PointsMaterial;
	readonly type: string;
	readonly isSimulationElement = true;
	_name: string;

	constructor(editor: Editor, name: string | undefined, type: string) {
		super();
		this.editor = editor;
		this.name = this._name = name ?? `Detect`;
		this.type = type;
		this.parent = null;
		this.material = SimulationPoints._detectPointsMaterial.clone();
	}
}
