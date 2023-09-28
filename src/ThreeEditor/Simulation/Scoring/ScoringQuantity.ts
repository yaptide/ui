import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationZone, SimulationZoneJSON } from '../Base/SimulationZone';
import { ScoringFilter } from './ScoringFilter';
import * as Scoring from './ScoringOutputTypes';
import { DifferentialJSON, DifferentialModifier } from './ScoringQtyModifiers';

export type ScoringQuantityJSON = Omit<
	SimulationZoneJSON & {
		keyword: Scoring.DETECTOR_KEYWORD;
		medium?: Scoring.MEDIUM;
		filter?: string;
		modifiers: DifferentialJSON[];
		rescale?: number;
	},
	never
>;

export class ScoringQuantity extends SimulationZone {
	readonly isQuantity: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	//TODO: Issue#320
	private _filter: string;
	private _rescale: number;
	private _medium: Scoring.MEDIUM;
	private _hasMaterial: boolean = false;
	private _modifiers: Record<string, DifferentialModifier>;

	hasFilter: boolean;
	hasRescale: boolean;
	keyword: Scoring.DETECTOR_KEYWORD;

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
		this.hasFilter = !!this._filter.length;
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
		this.hasRescale ||= rescale !== 1;
	}

	get rescale(): number {
		return this.hasRescale ? this._rescale : 1;
	}

	get hasMaterial(): boolean {
		if (['Dose', 'dLET', 'tLET'].includes(this.keyword)) return this._hasMaterial;

		return false;
	}

	set hasMaterial(hasMaterial: boolean) {
		this._hasMaterial = hasMaterial;
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
		const { materialUuid, materialPropertiesOverrides, customMaterial, ...json } =
			super.toJSON();
		let { filter, hasFilter, hasMaterial, keyword, modifiers, medium, rescale } = this;

		return {
			...(hasMaterial && {
				materialUuid,
				materialPropertiesOverrides,
				customMaterial
			}),
			...json,
			...(hasFilter && { filter: filter?.uuid }),
			...(medium && { medium }),
			...(rescale !== 1 && { rescale }),
			keyword,
			modifiers: modifiers.map(modifier => modifier.toJSON())
		};
	}

	fromJSON(json: ScoringQuantityJSON): this {
		const { filter, medium, rescale, keyword, modifiers, ...basicJSON } = json;
		this._modifiers = modifiers.reduce(
			(acc, curr) => {
				const modifier = DifferentialModifier.fromJSON(curr);
				acc[modifier.uuid] = modifier;

				return acc;
			},
			{} as Record<string, DifferentialModifier>
		);
		super.fromJSON(basicJSON);
		this.filter = filter ? this.editor.scoringManager.getFilterByUuid(filter) : null;
		this.keyword = keyword;
		this.medium = medium ?? Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
		this.rescale = rescale ?? 1;

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

export const isScoringQuantity = (x: unknown): x is ScoringQuantity => x instanceof ScoringQuantity;
