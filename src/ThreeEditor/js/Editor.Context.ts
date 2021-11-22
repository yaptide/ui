import * as THREE from 'three';
import { BasicMesh, isBasicMesh } from '../util/BasicMeshes';
import { Beam, isBeam } from '../util/Beam';
import * as CSG from '../util/CSG/CSG';
import { isZone } from '../util/CSG/CSG';
import { DetectFilter, isDetectFilter } from '../util/Detect/DetectFilter';
import { DetectGeometry, isDetectGeometry } from '../util/Detect/DetectGeometry';
import { DetectOutput } from '../util/Detect/DetectOutput';
import { isWorldZone, WorldZone } from '../util/WorldZone';
import { Editor } from './Editor';

export type Context = 'scene' | 'output' | 'parameters' | 'settings';
export type SceneObject = CSG.Zone | BasicMesh | WorldZone | Beam;
export type OutputObject = DetectFilter | DetectGeometry | DetectOutput;

export class ContextManager {
	private editor: Editor;
	private _context: Context;
	private _selected: [SceneObject | null, OutputObject | null];

	constructor(editor: Editor, context: Context = 'scene') {
		this.editor = editor;
		this._context = context;
		this._selected = [null, null];
	}

	set currentContext(context: Context) {
		if (this._context !== context) {
			this._context = context;
			this.editor.signals.contextChanged.dispatch(context);
		}
	}

	get currentContext(): Context {
		return this._context;
	}

	get renderList(): THREE.Scene[] {
		let list: THREE.Scene[] = [this.editor.sceneHelpers, this.editor.zoneManager];
		switch (this._context) {
			case 'scene':
				list.push(this.editor.scene);
				break;
			case 'output':
				list.push(this.editor.detectManager);
				break;
			default:
				break;
		}
		return list;
	}

	set selected(selected: SceneObject | OutputObject | null) {
		if (isOutputObject(selected)) {
			this._selected[1] = selected;
			if (this._context !== 'output') {
				this._context = 'output';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else if (isInputObject(selected)) {
			this._selected[0] = selected;
			if (this._context !== 'scene') {
				this._context = 'scene';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		} else {
			this._selected = [null, isDetectGeometry(this._selected[1]) ? null : this._selected[1]];
		}
	}

	selectedByContext(context: Context): SceneObject | OutputObject | null {
		switch (context) {
			case 'scene':
				return this._selected[0];
			case 'output':
				return this._selected[1];
			default:
				return null;
		}
	}

	get selected(): SceneObject | OutputObject | null {
		if (this._context === 'scene') {
			return this.selectedByContext('scene');
		} else {
			return this.selectedByContext('output');
		}
	}
}

export const isOutputObject = (x: unknown): x is OutputObject => {
	return isDetectGeometry(x) || isDetectFilter(x);
};

export const isInputObject = (x: unknown): x is SceneObject => {
	return isZone(x) || isWorldZone(x) || isBeam(x) || isBasicMesh(x);
};
