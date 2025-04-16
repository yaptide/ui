import { Signal } from 'signals';
import * as THREE from 'three';

import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationMeshJSON } from '../Base/SimulationMesh';
import { BasicFigure, BoxFigure, CylinderFigure, SphereFigure } from './BasicFigures';

type FigureManagerJSON = Omit<
	SimulationElementJSON & {
		figures: SimulationMeshJSON[];
		metadata: Record<string, string | number>;
	},
	never
>;

const figureLoader = (editor: YaptideEditor) => (json: SimulationMeshJSON) => {
	switch (json.type) {
		case 'BoxFigure':
			return new BoxFigure(editor).fromSerialized(json);
		case 'CylinderFigure':
			return new CylinderFigure(editor).fromSerialized(json);
		case 'SphereFigure':
			return new SphereFigure(editor).fromSerialized(json);
		default:
			throw new Error(`Unknown figure type: ${json.type}`);
	}
};

export class FigureContainer extends SimulationSceneContainer<BasicFigure> {
	readonly isFigureContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Figures', 'Figures', figureLoader(editor));
	}

	duplicate(): FigureContainer {
		const duplicated = new FigureContainer(this.editor);
		this.children.forEach(child => duplicated.add(child.duplicate()));

		return duplicated;
	}
}

export class FigureManager
	extends THREE.Scene
	implements SimulationPropertiesType, SimulationElementManager<'figure', BasicFigure>
{
	/****************************Private****************************/
	private readonly metadata = {
		version: `0.12`, //update this to current YaptideEditor version when format changes
		type: 'Manager',
		generator: 'FigureManager.toJSON'
	} satisfies Record<string, string | number>;

	private editor: YaptideEditor;
	private signals: {
		sceneGraphChanged: Signal;
	};

	private managerType: 'FigureManager' = 'FigureManager';

	private _name: string;
	/***************************************************************/

	/*******************SimulationPropertiesType********************/
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner = true;
	readonly isSimulationElement = true;
	readonly isFigureManager: true = true;
	/***************************************************************/

	/*************************FigureMethods*************************/
	figureContainer: SimulationSceneContainer<BasicFigure>;
	get figures() {
		return this.figureContainer.children;
	}

	addFigure(figure: BasicFigure<THREE.BufferGeometry>) {
		this.figureContainer.add(figure);
		this.editor.select(figure);
		this.signals.sceneGraphChanged.dispatch();
	}

	removeFigure(figure: BasicFigure<THREE.BufferGeometry>) {
		this.figureContainer.remove(figure);
		this.editor.deselect();
		this.signals.sceneGraphChanged.dispatch();
	}

	getFigureByUuid(uuid: string) {
		return this.figures.find(figure => figure.uuid === uuid) ?? null;
	}

	getFigureByName(name: string) {
		return this.figures.find(figure => figure.name === name) ?? null;
	}
	/***************************************************************/

	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = this._name = 'Figure Manager';

		this.figureContainer = new FigureContainer(editor);

		this.add(this.figureContainer);

		this.signals = editor.signals;
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);

		return this.fromSerialized(source.toSerialized());
	}

	reset() {
		this.name = this._name;
		this.figureContainer.reset();

		return this;
	}

	toSerialized(): FigureManagerJSON {
		const { uuid, name, managerType: type, metadata } = this;

		return {
			uuid,
			name,
			type,
			metadata,
			figures: this.figureContainer.toSerialized()
		};
	}

	fromSerialized(json: FigureManagerJSON) {
		const {
			metadata: { version }
		} = this;
		const { uuid, name, figures, metadata } = json;

		if (!metadata || metadata.version !== version)
			console.warn(`FigureManager version mismatch: ${metadata?.version} !== ${version}`);

		this.uuid = uuid;
		this.name = name;
		this.figureContainer.fromSerialized(figures);

		return this;
	}
}

export const isFigureContainer = (x: unknown): x is FigureContainer => x instanceof FigureContainer;

export const isFigureManager = (x: unknown): x is FigureManager => x instanceof FigureManager;
