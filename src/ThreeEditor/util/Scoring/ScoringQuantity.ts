import { Editor } from '../../js/Editor';
import { DetectFilter } from '../Detect/DetectFilter';
import { SimulationObject3D } from '../SimulationBase/SimulationMesh';
import * as Scoring from './ScoringOutputTypes';
import { ScoringQtyModifier } from './ScoringQtyModifiers';

export type ScoringQuantityJSON = {
	uuid: string;
	keyword: Scoring.DETECTOR_KEYWORD;
	filter?: string;
	modifiers: ScoringQtyModifier[];
};

export class ScoringQuantity extends SimulationObject3D {
	readonly isQuantity: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	//TODO: signal DetectFilter removed => clear _filter uuid if its the same as the removed filter
	private _filter: string;
	hasFilter: boolean;
	keyword: Scoring.DETECTOR_KEYWORD;
	modifiers: ScoringQtyModifier[];
	get filter(): DetectFilter | null {
		if (!this.hasFilter) return null;
		return this.editor.detectManager.getFilterByUuid(this._filter);
	}
	set filter(filter: DetectFilter | null) {
		this._filter = filter?.uuid ?? '';
	}

	constructor(
		editor: Editor,
		keyword: Scoring.DETECTOR_KEYWORD = 'Energy',
		modifiers: ScoringQtyModifier[] = []
	) {
		super(editor, 'Quantity', 'Quantity');
		this.modifiers = modifiers;
		this.keyword = keyword;
		this.hasFilter = false;
		this._filter = '';
	}
	toJSON(): ScoringQuantityJSON {
		let { filter, hasFilter, uuid, keyword, modifiers } = this;
		return {
			uuid,
			keyword,
			...(hasFilter && { filter: filter?.uuid }),
			modifiers
		};
	}
	fromJSON(json: ScoringQuantityJSON): this {
		this.uuid = json.uuid;
		this.modifiers = json.modifiers;
		this.filter = json.filter ? this.editor.detectManager.getFilterByUuid(json.filter) : null;
		if (this._filter.length) this.hasFilter = true;
		this.keyword = json.keyword;
		return this;
	}
	static fromJSON(editor: Editor, json: ScoringQuantityJSON): ScoringQuantity {
		return new ScoringQuantity(editor).fromJSON(json);
	}
}

export const isQuantity = (x: any): x is ScoringQuantity => x instanceof ScoringQuantity;
