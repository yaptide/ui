import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { generateSimulationInfo } from '../../../util/AdditionalGeometryData';
import { BasicFigure, BoxFigure } from './BasicFigures';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { UniqueChildrenNames, getNextFreeName } from '../../../util/Name/Name';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementManager } from '../Base/SimulationManager';

export class FigureContainer extends SimulationSceneContainer<BasicFigure> {
	readonly isFigureContainer: true = true;
	constructor(editor: Editor) {
		super(editor, 'Figures', 'Figures');
	}
}

//TODO: FigureScene should implement from SimulationSceneContainer or define container of this type
export class FigureScene
	extends THREE.Scene
	implements
		SimulationPropertiesType,
		UniqueChildrenNames,
		SimulationElementManager<'figure', BasicFigure>
{
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	private editor: Editor;
	readonly isFigureScene: true = true;
	constructor(editor: Editor) {
		super();

		this.editor = editor;
		this.name = 'Figures';
		this.figureContainer = new FigureContainer(editor);
	}

	addFigure(figure: BasicFigure<THREE.BufferGeometry>) {
		this.add(figure);
		this.editor.select(figure);
	}
	removeFigure(figure: BasicFigure<THREE.BufferGeometry>) {
		this.remove(figure);
		this.editor.deselect();
	}
	createFigure() {
		const figure = new BoxFigure(this.editor);
		this.addFigure(figure);
		return figure;
	}
	getFigureByUuid(uuid: string) {
		throw new Error('Method not implemented.');
		return null;
	}
	getFigureByName(name: string) {
		throw new Error('Method not implemented.');
		return null;
	}

	figureContainer;

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
