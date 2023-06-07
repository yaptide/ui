import * as THREE from 'three';
import { ScoringFilter, isDetectFilter } from '../Simulation/Scoring/ScoringFilter';
import { Detector, isDetector } from '../Simulation/Detectors/Detector';
import {
	DetectorContainer,
	DetectorManager,
	isDetectContainer
} from '../Simulation/Detectors/DetectorManager';
import {
	FilterContainer,
	isFilterContainer,
	isScoringManager,
	ScoringManager
} from '../Simulation/Scoring/ScoringManager';
import { ScoringOutput, isOutput } from '../Simulation/Scoring/ScoringOutput';
import { isQuantity, ScoringQuantity } from '../Simulation/Scoring/ScoringQuantity';
import { isWorldZone, WorldZone } from '../Simulation/Zones/WorldZone/WorldZone';
import { YaptideEditor } from './YaptideEditor';
import { SimulationZone } from '../Simulation/Base/SimulationZone';
import { ZoneContainer, ZoneManager, isZoneContainer } from '../Simulation/Zones/ZoneManager';
import { isBooleanZone } from '../Simulation/Zones/BooleanZone';
import { Beam, isBeam } from '../Simulation/Physics/Beam';
import { BasicFigure, isBasicFigure } from '../Simulation/Figures/BasicFigures';
import { SingletonContainer } from '../Simulation/Base/SimulationContainer';
import { BeamModulator } from '../Simulation/SpecialComponents/BeamModulator';
import { CTCube } from '../Simulation/SpecialComponents/CTCube';
import { isSpecialComponent } from '../Simulation/SpecialComponents/SpecialComponentManager';

export type Context = 'geometry' | 'scoring' | 'settings';
export type GeometryObject =
	| SimulationZone
	| BasicFigure
	| WorldZone
	| Detector
	| DetectorContainer
	| DetectorManager
	| ZoneContainer
	| ZoneManager
	| THREE.Scene
	| SingletonContainer<CTCube | BeamModulator>
	| CTCube
	| BeamModulator;
export type ScoringContextObject =
	| ScoringFilter
	| ScoringOutput
	| ScoringManager
	| ScoringQuantity
	| FilterContainer;

export type SettingsContextObject = Beam;

export class ContextManager {
	private editor: YaptideEditor;
	private _context: Context;
	private _selected: [GeometryObject | null, ScoringContextObject | null, SettingsContextObject];

	constructor(editor: YaptideEditor, context: Context = 'geometry') {
		this.editor = editor;
		this._context = context;
		this._selected = [null, null, editor.beam];
		this.editor.signals.contextChanged.add(this.setVisibility.bind(this));
		this.setVisibility(context);
	}

	reset = () => {
		this._selected = [null, null, this.editor.beam];
		this.editor.signals.objectSelected.dispatch(this.selected);
	};

	set currentContext(context: Context) {
		if (this._context !== context) {
			this._context = context;
			this.editor.signals.contextChanged.dispatch(context);
			this.editor.signals.objectSelected.dispatch(this.selected);
		}
	}

	get currentContext(): Context {
		return this._context;
	}

	getClickableObjects(): THREE.Object3D[] {
		let clickable: THREE.Object3D[] = [];
		switch (this._context) {
			case 'geometry':
				clickable = clickable.concat(
					this.editor.figureManager.visible ? this.editor.figureManager.children : []
				);
				break;
			case 'scoring':
				clickable = clickable.concat(
					this.editor.detectorManager.detectorContainer.visible
						? this.editor.detectorManager.children
						: []
				);
				break;
			default:
				return [];
		}
		return clickable;
	}

	setVisibility(context: Context): void {
		let visible: THREE.Object3D[] = [this.editor.sceneHelpers];
		let hidden: THREE.Object3D[] = [];
		switch (context) {
			case 'geometry':
				visible.push(
					this.editor.figureManager,
					this.editor.zoneManager,
					this.editor.detectorManager,
					this.editor.specialComponentsManager
				);
				hidden.push();
				break;
			case 'scoring':
				visible.push(this.editor.detectorManager);
				hidden.push(
					this.editor.zoneManager,
					this.editor.figureManager,
					this.editor.specialComponentsManager,
					this.editor.beam
				);
				break;
			case 'settings':
				visible.push(
					this.editor.figureManager,
					this.editor.detectorManager,
					this.editor.beam
				);
				hidden.push(this.editor.zoneManager, this.editor.specialComponentsManager);
				break;
			default:
				visible.push(
					this.editor.figureManager,
					this.editor.zoneManager,
					this.editor.detectorManager,
					this.editor.specialComponentsManager,
					this.editor.beam
				);
				break;
		}
		visible.forEach(scene => {
			scene.visible = true;
		});
		hidden.forEach(scene => {
			scene.visible = false;
		});
		this.editor.signals.sceneGraphChanged.dispatch();
	}

	set selected(selected: GeometryObject | ScoringContextObject | SettingsContextObject | null) {
		if (isSettingsContextObject(selected)) {
			if (this._context !== 'settings') {
				this._context = 'settings';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else if (isScoringContextObject(selected)) {
			this._selected[1] = selected;
			if (this._context !== 'scoring') {
				this._context = 'scoring';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else if (isGeometryContextObject(selected)) {
			this._selected[0] = selected;
			if (this._context !== 'geometry') {
				this._context = 'geometry';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else {
			this._selected = [null, null, this.editor.beam];
		}
	}

	get selected(): GeometryObject | ScoringContextObject | SettingsContextObject | null {
		return this.selectedByContext(this._context);
	}

	selectedByContext(
		context: Context
	): GeometryObject | ScoringContextObject | SettingsContextObject | null {
		switch (context) {
			case 'geometry':
				return this._selected[0];
			case 'scoring':
				return this._selected[1];
			case 'settings':
				return this._selected[2];
			default:
				return null;
		}
	}
}

export const isScoringContextObject = (x: unknown): x is ScoringContextObject => {
	return (
		isDetectFilter(x) ||
		isFilterContainer(x) ||
		isOutput(x) ||
		isQuantity(x) ||
		isScoringManager(x)
	);
};

export const isGeometryContextObject = (x: unknown): x is GeometryObject => {
	return (
		isDetector(x) ||
		isDetectContainer(x) ||
		isBooleanZone(x) ||
		isWorldZone(x) ||
		isBasicFigure(x) ||
		isZoneContainer(x) ||
		isSpecialComponent(x) ||
		x instanceof THREE.Scene
	);
};

export const isSettingsContextObject = (x: unknown): x is SettingsContextObject => {
	return isBeam(x);
};
