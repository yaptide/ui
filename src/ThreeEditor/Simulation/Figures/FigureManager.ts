import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { getGeometryData } from '../../../util/AdditionalGeometryData';
import { BasicFigure, BoxFigure, CylinderFigure, SphereFigure } from './BasicFigures';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { UniqueChildrenNames, getNextFreeName } from '../../../util/Name/Name';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementManager } from '../Base/SimulationManager';
import { EditorObjectLoader } from '../../../util/ObjectLoader';
import { SimulationMeshJSON } from '../Base/SimulationMesh';

const figureLoader = (editor: YaptideEditor) => (json: SimulationMeshJSON) => {
	switch (json.type) {
		case 'BoxFigure':
			return new BoxFigure(editor).fromJSON(json);
		case 'CylinderFigure':
			return new CylinderFigure(editor).fromJSON(json);
		case 'SphereFigure':
			return new SphereFigure(editor).fromJSON(json);
		default:
			throw new Error(`Unknown figure type: ${json.type}`);
	}
};

export class FigureContainer extends SimulationSceneContainer<BasicFigure> {
	readonly isFigureContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Figures', 'Figures', figureLoader(editor));
	}
	toJSON() {
		return this.children.map(child => child.toJSON());
	}
}

export class FigureManager
	extends THREE.Scene
	implements SimulationPropertiesType, SimulationElementManager<'figure', BasicFigure>
{
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly loader: EditorObjectLoader;

	figureContainer: SimulationSceneContainer<BasicFigure>;

	private editor: YaptideEditor;
	readonly isFigureScene: true = true;
	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = 'Figures';
		this.figureContainer = new FigureContainer(editor);
		this.add(this.figureContainer);
		this.loader = new EditorObjectLoader(editor);
	}

	addFigure(figure: BasicFigure<THREE.BufferGeometry>) {
		this.figureContainer.add(figure);
		this.editor.select(figure);
	}
	removeFigure(figure: BasicFigure<THREE.BufferGeometry>) {
		this.figureContainer.remove(figure);
		this.editor.deselect();
	}
	createFigure() {
		const figure = new BoxFigure(this.editor);
		this.addFigure(figure);
		return figure;
	}
	getFigureByUuid(uuid: string) {
		return this.figureContainer.children.find(figure => figure.uuid === uuid) ?? null;
	}
	getFigureByName(name: string) {
		return this.figureContainer.children.find(figure => figure.name === name) ?? null;
	}

	toJSON(): unknown {
		const data = super.toJSON();
		data.object.children = this.children.map(child => {
			const { object } = child.toJSON();
			object.geometryData = getGeometryData(child as BasicFigure);
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
