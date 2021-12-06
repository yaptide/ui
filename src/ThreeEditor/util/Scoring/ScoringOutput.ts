import { Editor } from '../../js/Editor';
import { DetectGeometry } from '../Detect/DetectGeometry';
import { SimulationSceneGroup } from '../SimulationBase/SimulationGroup';
import { ScoringQuantity, ScoringQuantityJSON } from './ScoringQuantity';

export type ScoringOutputJSON = {
	name: string;
	quantities: ScoringQuantityJSON[];
	detectGeometry?: string;
	primaries?: number;
	trace?: boolean;
};
export class ScoringOutput extends SimulationSceneGroup<ScoringQuantity> {
	readonly isOutput: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	private _geometry?: string;
	get geometry(): DetectGeometry | null {
		if (!this._geometry) return null;
		return this.editor.detectManager.getGeometryByUuid(this._geometry);
	}
	set geometry(geometry: DetectGeometry | null) {
		this._geometry = geometry?.uuid;
	}

	constructor(editor: Editor) {
		super(editor, 'Output', 'Output');
		this.children = [];
		this.parent = null;
	}
}

export const isOutput = (x: any): x is ScoringOutput => x instanceof ScoringOutput;
