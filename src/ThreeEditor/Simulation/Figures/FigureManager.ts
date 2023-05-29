import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { generateSimulationInfo } from '../../../util/AdditionalGeometryData';
import { BasicFigure, BoxFigure } from './BasicFigures';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { UniqueChildrenNames, getNextFreeName } from '../../../util/Name/Name';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementManager } from '../Base/SimulationManager';
import { EditorObjectLoader } from '../../../util/ObjectLoader';

export class FigureContainer extends SimulationSceneContainer<BasicFigure> {
	readonly isFigureContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Figures', 'Figures');
	}
}

//TODO: FigureScene should implement from SimulationSceneContainer or define container of this type
export class FigureManager
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
	readonly loader: EditorObjectLoader;

	private editor: YaptideEditor;
	readonly isFigureScene: true = true;
	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = 'Figures';
		this.figureContainer = new FigureContainer(editor);
		this.loader = new EditorObjectLoader(editor);
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

	uniqueNameForChild(object: THREE.Object3D<THREE.Event>, newName?: string | undefined): string {
		return getNextFreeName(this, newName ?? object.name, object);
	}
	add(object: THREE.Object3D<THREE.Event>): this {
		object.name = this.uniqueNameForChild(object);
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
	fromJSON(json: any) {
		const tmpScene = this.loader.parse(json);
		this.uuid = tmpScene.uuid;
		this.name = tmpScene.name;

		while (tmpScene.children.length > 0) {
			const child = tmpScene.children[0];
			this.add(child);
		}
	}
}
