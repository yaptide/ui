import { Object3D } from 'three';
import { BasicMesh, isBasicMesh } from '../util/BasicMeshes';
import { Beam, isBeam } from '../util/Beam';
import * as CSG from '../util/CSG/CSG';
import { isZone } from '../util/CSG/CSG';
import { DetectFilter, isDetectFilter } from '../util/Detect/DetectFilter';
import { DetectGeometry, isDetectGeometry } from '../util/Detect/DetectGeometry';
import { DetGeoContainer } from '../util/Detect/DetectManager';
import { isWorldZone, WorldZone } from '../util/WorldZone';
import { Editor } from './Editor';

export type Context = 'Scene' | 'Output' | 'Parameters';

export class EditorContext {
	private editor: Editor;
	private _context: Context;
	private _selected: [
		CSG.Zone | BasicMesh | WorldZone | Beam | null,
		DetectFilter | DetectGeometry | null,
		never
	];
	constructor(editor: Editor, context: Context = 'Scene') {
		this.editor = editor;
		this._context = context;
		this._selected = [null, null, undefined as never];
	}
	set context(context: Context) {
		this._context = context;
	}
	get context(): Context {
		return this._context;
	}
	set selected(
		selected:
			| CSG.Zone
			| CSG.ZoneContainer
			| DetGeoContainer
			| BasicMesh
			| WorldZone
			| null
			| DetectFilter
			| DetectGeometry
	) {
		if (isDetectGeometry(selected) || isDetectFilter(selected)) {
			this._selected[1] = selected;
			if (this._context !== 'Output') {
				this._context = 'Output';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		}
		if (
			isZone(selected) ||
			isWorldZone(selected) ||
			isBeam(selected) ||
			isBasicMesh(selected)
		) {
			this._selected[0] = selected;
			if (this._context !== 'Scene') {
				this._context = 'Scene';
				this.editor.signals.contextChanged.dispatch(this._context);
			}
		}
	}
}
