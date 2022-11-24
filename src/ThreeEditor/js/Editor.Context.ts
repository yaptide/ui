import { stringify } from 'querystring';
import * as THREE from 'three';
import { BasicMesh, isBasicMesh } from '../util/BasicMeshes';
import { Beam, isBeam } from '../util/Beam';
import * as CSG from '../util/CSG/CSG';
import { isZone, isZoneContainer } from '../util/CSG/CSG';
import { DetectFilter, isDetectFilter } from '../util/Detect/DetectFilter';
import { DetectGeometry, isDetectGeometry } from '../util/Detect/DetectGeometry';
import {
	DetectContainer,
	DetectManager,
	FilterContainer,
	isDetectContainer,
	isFilterContainer
} from '../util/Detect/DetectManager';
import { PropertyManager } from '../util/Manager/PropertyManager';
import { isScoringManager, ScoringManager } from '../util/Scoring/ScoringManager';
import { ScoringOutput, isOutput } from '../util/Scoring/ScoringOutput';
import { isQuantity, ScoringQuantity } from '../util/Scoring/ScoringQuantity';
import { isWorldZone, WorldZone } from '../util/WorldZone/WorldZone';
import { Editor } from './Editor';

const CONTEXT_VALUES = ['geometry', 'scoring', 'settings'] as const;
export type Context = typeof CONTEXT_VALUES[number];

export type SceneObject =
	| CSG.Zone
	| BasicMesh
	| WorldZone
	| DetectGeometry
	| DetectContainer
	| DetectManager
	| CSG.ZoneContainer
	| CSG.ZoneManager
	| THREE.Scene;
export type OutputObject =
	| DetectFilter
	| ScoringOutput
	| ScoringManager
	| ScoringQuantity
	| FilterContainer;

export type SimulationSettingsObject = Beam;

type Selectable = SceneObject | OutputObject | SimulationSettingsObject | null;

export const isOutputObject = (x: unknown): x is OutputObject => {
	return (
		isDetectFilter(x) ||
		isFilterContainer(x) ||
		isOutput(x) ||
		isQuantity(x) ||
		isScoringManager(x)
	);
};

export const isInputObject = (x: unknown): x is SceneObject => {
	return (
		isDetectGeometry(x) ||
		isDetectContainer(x) ||
		isZone(x) ||
		isWorldZone(x) ||
		isBasicMesh(x) ||
		isZoneContainer(x) ||
		x instanceof THREE.Scene
	);
};

export const isSimulationSettingsObject = (x: unknown): x is SimulationSettingsObject => {
	return isBeam(x);
};

export class ContextManager extends PropertyManager<Context> {
	private _selectedManager;
	private _handleSelection(object: Selectable) {
		if (object === null) return;
		if (isInputObject(object)) {
			this.currentValue = 'geometry';
		} else if (isOutputObject(object)) {
			this.currentValue = 'scoring';
		} else if (isSimulationSettingsObject(object)) {
			this.currentValue = 'settings';
		} else {
			this.currentValue = 'geometry';
		}
	}

	private getContextFromObject(object: Selectable) {
		switch (true) {
			case isInputObject(object):
				return 'geometry';
			case isOutputObject(object):
				return 'scoring';
			case isSimulationSettingsObject(object):
				return 'settings';
			default:
				return 'geometry';
		}
	}

	private _setVisibility(context: Context) {
		let objects: Record<
			string,
			{
				value: boolean;
				array: THREE.Object3D[];
			}
		> = {
			visible: {
				array: [this.editor.sceneHelpers],
				value: true
			},
			hidden: {
				array: [],
				value: false
			}
		};

		switch (context) {
			case 'geometry':
				objects.visible.array.push(
					this.editor.scene,
					this.editor.zoneManager,
					this.editor.detectManager
				);
				objects.hidden.array.push(this.editor.beam);
				break;
			case 'scoring':
				objects.visible.array.push(this.editor.detectManager, this.editor.scene);
				objects.hidden.array.push(this.editor.zoneManager, this.editor.beam);
				break;
			case 'settings':
				objects.visible.array.push(
					this.editor.scene,
					this.editor.detectManager,
					this.editor.beam
				);
				objects.hidden.array.push(this.editor.zoneManager);
				break;
			default:
				objects.visible.array.push(
					this.editor.scene,
					this.editor.zoneManager,
					this.editor.detectManager,
					this.editor.sceneHelpers,
					this.editor.beam
				);
				break;
		}

		Object.entries(objects).forEach(([_, { array, value }]) =>
			array.forEach(object => {
				object.visible = value;
			})
		);

		this.editor.signals.sceneGraphChanged.dispatch();
	}

	constructor(editor: Editor, value: Context = 'geometry') {
		super(editor, value);
		this._selectedManager = {} as Record<Context, PropertyManager<Selectable>>;

		CONTEXT_VALUES.forEach(context => {
			let value = context === 'settings' ? editor.beam : null;
			let selectManager = new PropertyManager<Selectable>(editor, value);
			this._selectedManager[context] = selectManager;

			selectManager.addPropertyChangedListener(editor.signals.objectSelected.dispatch);
			selectManager.addPropertyChangedListener(this._handleSelection.bind(this));
		});

		this.addPropertyChangedListener(editor.signals.contextChanged.dispatch);
		this.addPropertyChangedListener(context =>
			editor.signals.objectSelected.dispatch(this._selectedManager[context].currentValue)
		);
		this.addPropertyChangedListener(this._setVisibility.bind(this));
	}

	reset() {
		super.reset();

		CONTEXT_VALUES.forEach(context => this._selectedManager[context].reset());
	}

	getClickables(): THREE.Object3D[] {
		let clickables = [] as THREE.Object3D[];

		switch (this.currentValue) {
			case 'geometry':
				return clickables
					.concat(this.editor.scene.visible ? this.editor.scene.children : [])
					.concat(
						this.editor.detectManager.detectContainer.visible
							? this.editor.detectManager.children
							: []
					);
			case 'scoring':
				return clickables.concat(
					this.editor.detectManager.detectContainer.visible
						? this.editor.detectManager.children
						: []
				);
			default:
				return clickables;
		}
	}

	set currentContext(context: Context) {
		this.currentValue = context;
	}

	get currentContext(): Context {
		return this.currentValue;
	}

	set currentSelected(object: Selectable) {
		if (object) {
			const context = this.getContextFromObject(object);

			switch (context) {
				case 'geometry':
					//Select output when on scoring tab clicking on detect geometry
					if (isDetectGeometry(object) && this.currentValue === 'scoring') {
						const output = this.editor.scoringManager.getOutputByGeometryUuid(
							object.uuid
						);
						this._selectedManager.scoring.currentValue = output ?? null;
						this.editor.signals.geometryChanged.dispatch(object);
						return;
					}
					this._selectedManager.geometry.currentValue = object;
					break;
				case 'scoring':
					this._selectedManager.scoring.currentValue = object;
					break;

				default:
					break;
			}

			if (context !== this.currentValue) {
				this.currentValue = context;
			}
		} else {
			switch (this.currentValue) {
				case 'geometry':
				case 'scoring':
					this._selectedManager[this.currentValue].currentValue = null;
					break;
				case 'settings':
					this._selectedManager.settings.currentValue = this.editor.beam;
					break;
				default:
					break;
			}
		}
	}

	get currentSelected(): Selectable {
		return this._selectedManager[this.currentValue].currentValue;
	}
}
