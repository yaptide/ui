import * as THREE from 'three';
import { Editor } from '../js/Editor';
import { generateSimulationInfo } from './AdditionalGeometryData';
import { BasicMesh } from './BasicMeshes';
import { ISimulationObject } from './SimulationBase/SimulationObject';

export class FigureScene extends THREE.Scene implements ISimulationObject {
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	private editor: Editor;
	readonly isFigureScene: true = true;
	constructor(editor: Editor) {
		super();

		this.name = 'Figures';
		this.editor = editor;
	}
	toJSON(): unknown {
		const data = super.toJSON();
		data.object.children = this.children.map(child => {
			const { object } = child.toJSON();
			object.geometryData = generateSimulationInfo(child as BasicMesh);
			return object;
		});
		return data;
	}
}
