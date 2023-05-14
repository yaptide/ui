import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { generateSimulationInfo } from '../../../util/AdditionalGeometryData';
import { BasicFigure } from './BasicFigures';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { UniqueChildrenNames, getNextFreeName } from '../../../util/Name/Name';

export class FigureScene
	extends THREE.Scene
	implements SimulationPropertiesType, UniqueChildrenNames
{
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
	getNextFreeName(object: THREE.Object3D<THREE.Event>, newName?: string | undefined): string {
		return getNextFreeName(this, newName ?? object.name, object);
	}
	add(object: THREE.Object3D<THREE.Event>): this {
		object.name = this.getNextFreeName(object);
		return super.add(object);
	}
	toJSON(): unknown {
		const data = super.toJSON();
		data.object.children = this.children.map(child => {
			const { object } = child.toJSON();
			object.geometryData = generateSimulationInfo(child as BasicFigure);
			return object;
		});
		return data;
	}
}
