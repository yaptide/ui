import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';
import SimulationMaterial from '../Materials/SimulationMaterial';
import { ScoringFilter } from './ScoringFilter';
import * as Scoring from './ScoringOutputTypes';
import { DifferentialJSON, DifferentialModifier } from './ScoringQtyModifiers';

export type ScoringQuantityJSON = Omit<
	SimulationElementJSON & {
		keyword: Scoring.DETECTOR_KEYWORD;
		medium?: Scoring.MEDIUM;
		materialUuid?: string;
		filter?: string;
		modifiers: DifferentialJSON[];
		rescale?: number;
	},
	never
>;

export class ScoringQuantity extends SimulationElement {
	readonly isQuantity: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	//TODO: Issue#320
	private _filter: string;
	private _rescale: number;
	private _medium: Scoring.MEDIUM;
	private _simulationMaterial: SimulationMaterial;

	hasFilter: boolean;
	hasRescale: boolean;
	keyword: Scoring.DETECTOR_KEYWORD;

	private _modifiers: Record<string, DifferentialModifier>;
	get modifiers(): DifferentialModifier[] {
		return Object.values(this._modifiers);
	}

	private _selectedModifier?: string;
	set selectedModifier(mod: DifferentialModifier | undefined) {
		this._selectedModifier = mod?.uuid;
	}

	get selectedModifier(): DifferentialModifier | undefined {
		return this._selectedModifier ? this._modifiers[this._selectedModifier] : undefined;
	}

	get filter(): ScoringFilter | null {
		if (!this.hasFilter) return null;

		return this.editor.scoringManager.getFilterByUuid(this._filter);
	}

	set filter(filter: ScoringFilter | null) {
		this._filter = filter?.uuid ?? '';
	}

	get medium(): Scoring.MEDIUM | null {
		if (['NEqvDose', 'NKERMA'].includes(this.keyword)) return this._medium;

		return null;
	}

	set medium(medium: Scoring.MEDIUM | null) {
		this._medium = medium ?? Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
	}

	set rescale(rescale: number) {
		this._rescale = rescale;
	}

	get rescale(): number {
		return this.hasRescale ? this._rescale : 1;
	}

	addModifier(modifier: DifferentialModifier): void {
		this._modifiers[modifier.uuid] = modifier;
	}

	createModifier(): DifferentialModifier {
		const modifier = new DifferentialModifier();
		this.addModifier(modifier);

		return modifier;
	}

	removeModifier(modifier: DifferentialModifier): void {
		delete this._modifiers[modifier.uuid];
	}

	getModifierByUuid(uuid: string): DifferentialModifier | undefined {
		return this._modifiers[uuid];
	}

	constructor(editor: YaptideEditor, keyword: Scoring.DETECTOR_KEYWORD = 'Dose') {
		super(editor, 'Quantity', 'Quantity');
		this._modifiers = {};
		this.keyword = keyword;
		this.hasFilter = false;
		this._filter = '';
		this._medium = Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
		this._rescale = 1;
		this.hasRescale = false;
	}

	toJSON(): ScoringQuantityJSON {
		let { filter, name, type, hasFilter, uuid, keyword, modifiers, medium, rescale } = this;

		return {
			name,
			uuid,
			type,
			keyword,
			...(hasFilter && { filter: filter?.uuid }),
			...(medium && { medium }),
			...(rescale !== 1 && { rescale }),
			modifiers: modifiers.map(modifier => modifier.toJSON())
		};
	}

	fromJSON(json: ScoringQuantityJSON): this {
		this.name = json.name ?? this.name;
		this.uuid = json.uuid;
		this._modifiers = json.modifiers.reduce(
			(acc, curr) => {
				const modifier = DifferentialModifier.fromJSON(curr);
				acc[modifier.uuid] = modifier;

				return acc;
			},
			{} as Record<string, DifferentialModifier>
		);
		this.filter = json.filter ? this.editor.scoringManager.getFilterByUuid(json.filter) : null;

		if (this._filter.length) this.hasFilter = true;
		this.keyword = json.keyword;

		return this;
	}

	static fromJSON(editor: YaptideEditor, json: ScoringQuantityJSON): ScoringQuantity {
		return new ScoringQuantity(editor).fromJSON(json);
	}

	duplicate(): ScoringQuantity {
		const duplicated = new ScoringQuantity(this.editor, this.keyword);

		duplicated.name = this.name;

		duplicated._modifiers = this.modifiers.reduce(
			(acc, curr) => {
				const modifier = curr.duplicate();
				acc[modifier.uuid] = modifier;

				return acc;
			},
			{} as Record<string, DifferentialModifier>
		);

		duplicated.filter = this.filter;

		if (duplicated._filter.length) duplicated.hasFilter = true;

		return duplicated;
	}
}

export const isQuantity = (x: unknown): x is ScoringQuantity => x instanceof ScoringQuantity;
