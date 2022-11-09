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
import { isScoringManager, ScoringManager } from '../util/Scoring/ScoringManager';
import { ScoringOutput, isOutput } from '../util/Scoring/ScoringOutput';
import { isQuantity, ScoringQuantity } from '../util/Scoring/ScoringQuantity';
import { isWorldZone, WorldZone } from '../util/WorldZone/WorldZone';
import { Editor } from './Editor';

export type Context = 'geometry' | 'scoring' | 'settings';
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

export class ContextManager {
	private editor: Editor;
	private _context: Context;
	private _selected: [SceneObject | null, OutputObject | null, SimulationSettingsObject];

	constructor(editor: Editor, context: Context = 'geometry') {
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
					this.editor.scene.visible ? this.editor.scene.children : []
				);
				break;
			case 'scoring':
				clickable = clickable.concat(
					this.editor.detectManager.detectContainer.visible
						? this.editor.detectManager.children
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
				visible.push(this.editor.scene, this.editor.zoneManager, this.editor.detectManager);
				hidden.push(this.editor.beam);
				break;
			case 'scoring':
				visible.push(this.editor.detectManager, this.editor.scene);
				hidden.push(this.editor.zoneManager, this.editor.beam);
				break;
			case 'settings':
				visible.push(this.editor.scene, this.editor.detectManager);
				hidden.push(this.editor.zoneManager);
				break;
			default:
				visible.push(
					this.editor.scene,
					this.editor.zoneManager,
					this.editor.detectManager,
					this.editor.sceneHelpers,
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

	set selected(selected: SceneObject | OutputObject | SimulationSettingsObject | null) {
		if (isSimulationSettingsObject(selected)) {
			if (this._context !== 'settings') {
				this._context = 'settings';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else if (isOutputObject(selected)) {
			this._selected[1] = selected;
			if (this._context !== 'scoring') {
				this._context = 'scoring';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else if (isInputObject(selected)) {
			this._selected[0] = selected;
			if (this._context !== 'geometry') {
				this._context = 'geometry';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else {
			this._selected = [null, null, this.editor.beam];
		}
	}

	get selected(): SceneObject | OutputObject | SimulationSettingsObject | null {
		return this.selectedByContext(this._context);
	}

	selectedByContext(
		context: Context
	): SceneObject | OutputObject | SimulationSettingsObject | null {
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
