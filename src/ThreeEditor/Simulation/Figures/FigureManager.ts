import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { EditorObjectLoader } from '../../../util/ObjectLoader';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationMeshJSON } from '../Base/SimulationMesh';
import { BasicFigure, BoxFigure, CylinderFigure, SphereFigure } from './BasicFigures';

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

type FigureManagerJSON = Omit<
	SimulationElementJSON & {
		figures: SimulationMeshJSON[];
	},
	never
>;

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
	_name: string;
	get figures() {
		return this.figureContainer.children;
	}

	private editor: YaptideEditor;
	readonly isFigureScene: true = true;
	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = this._name = 'Figures';
		this.figureContainer = new FigureContainer(editor);
		this.add(this.figureContainer);
		this.loader = new EditorObjectLoader(editor);
	}

	reset(): this {
		this.name = this._name;
		this.figureContainer.reset();
		return this;
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
		return this.figures.find(figure => figure.uuid === uuid) ?? null;
	}
	getFigureByName(name: string) {
		return this.figures.find(figure => figure.name === name) ?? null;
	}

	toJSON() {
		const { uuid, name, type } = this;
		return {
			uuid,
			name,
			type,
			figures: this.figures.map(child => child.toJSON())
		};
	}
	fromJSON(json: FigureManagerJSON) {
		const { figures, uuid, name } = json;
		this.uuid = uuid;
		this.name = name;
		this.figureContainer.fromJSON(figures);
		return this;
	}
}
