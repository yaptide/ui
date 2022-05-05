import * as THREE from 'three';
import { isBasicMesh } from '../util/BasicMeshes';
import { isBeam } from '../util/Beam';
import { isZone, isZoneContainer } from '../util/CSG/CSG';
import { isDetectFilter } from '../util/Detect/DetectFilter';
import { isDetectGeometry } from '../util/Detect/DetectGeometry';
import { isDetectContainer, isFilterContainer } from '../util/Detect/DetectManager';
import { isScoringManager } from '../util/Scoring/ScoringManager';
import { isOutput } from '../util/Scoring/ScoringOutput';
import { isQuantity } from '../util/Scoring/ScoringQuantity';
import { SimulationObject3D } from '../util/SimulationBase/SimulationMesh';
import { isTreatmentPlan } from '../util/TreatmentPlan/TreatmentPlan';
import { isWorldZone } from '../util/WorldZone';
import { Editor } from './Editor';

export type Context = 'scene' | 'scoring' | 'parameters' | 'settings';
export type SceneObject = SimulationObject3D; // guard isSceneObject define allowed types
export type OutputObject = SimulationObject3D; // guard isOutputObject define allowed types

export class ContextManager {
	private editor: Editor;
	private _context: Context;
	private _selected: [SceneObject | null, OutputObject | null];

	constructor(editor: Editor, context: Context = 'scene') {
		this.editor = editor;
		this._context = context;
		this._selected = [null, null];
		this.editor.signals.contextChanged.add(this.setVisibility.bind(this));
		this.setVisibility(context);
	}

	reset = () => {
		this._selected = [null, null];
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
			case 'scene':
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
		let visible: THREE.Scene[] = [this.editor.sceneHelpers, this.editor.zoneManager];
		let hidden: THREE.Scene[] = [];
		switch (context) {
			case 'scene':
				visible.push(this.editor.scene);
				hidden.push(this.editor.detectManager);
				break;
			case 'scoring':
				visible.push(this.editor.detectManager);
				hidden.push(this.editor.scene);
				break;
			default:
				hidden.push(this.editor.scene);
				hidden.push(this.editor.detectManager);
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

	set selected(selected: SceneObject | OutputObject | null) {
		if (isOutputObject(selected)) {
			this._selected[1] = selected;
			if (this._context !== 'scoring') {
				this._context = 'scoring';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else if (isInputObject(selected)) {
			this._selected[0] = selected;
			if (this._context !== 'scene') {
				this._context = 'scene';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else {
			this._selected = [null, null];
		}
	}

	selectedByContext(context: Context): SceneObject | OutputObject | null {
		switch (context) {
			case 'scene':
				return this._selected[0];
			case 'scoring':
				return this._selected[1];
			default:
				return null;
		}
	}

	get selected(): SceneObject | OutputObject | null {
		return this.selectedByContext(this._context);
	}
}

export const isOutputObject = (x: unknown): x is OutputObject => {
	return (
		isDetectGeometry(x) ||
		isDetectFilter(x) ||
		isDetectContainer(x) ||
		isFilterContainer(x) ||
		isOutput(x) ||
		isQuantity(x) ||
		isScoringManager(x)
	);
};

export const isInputObject = (x: unknown): x is SceneObject => {
	return (
		isZone(x) ||
		isWorldZone(x) ||
		isBeam(x) ||
		isBasicMesh(x) ||
		isZoneContainer(x) ||
		x instanceof THREE.Scene ||
		isTreatmentPlan(x)
	);
};
