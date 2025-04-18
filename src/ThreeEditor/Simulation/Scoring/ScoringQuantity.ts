import { Serializable } from 'node:child_process';

import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationZone, SimulationZoneJSON } from '../Base/SimulationZone';
import { ScoringFilter } from './ScoringFilter';
import * as Scoring from './ScoringOutputTypes';
import { getQuantityModifiersOptions, SCORING_TYPE_ENUM } from './ScoringOutputTypes';
import { DifferentialJSON, DifferentialModifier } from './ScoringQtyModifiers';

export type ScoringQuantityJSON = Omit<
	SimulationZoneJSON & {
		keyword: Scoring.SCORING_KEYWORD;
		medium?: Scoring.MEDIUM;
		filter?: string;
		modifiers: DifferentialJSON[];
		primaries?: number;
		rescale?: number;
	},
	never
>;

export class ScoringQuantity
	extends SimulationZone
	implements SerializableState<ScoringQuantityJSON>
{
	readonly isQuantity: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	//TODO: Issue#320
	private _filter: string;
	private _rescale: number;
	private _medium: Scoring.MEDIUM;
	private _hasMaterial: boolean = true;
	private _modifiers: Record<string, DifferentialModifier>;
	private _primaries: number | null = null;
	private _hasPrimaries: boolean = false;
	private _keyword!: Scoring.SCORING_KEYWORD;

	get keyword(): Scoring.SCORING_KEYWORD {
		return this._keyword;
	}

	set keyword(keyword: Scoring.SCORING_KEYWORD) {
		this._keyword = keyword;
		let currentSimulator = this.editor.contextManager.currentSimulator;

		if (!Scoring.canChangeMaterialMedium(currentSimulator, this.getScoringType(), keyword))
			this.hasMaterial = false;
	}

	hasFilter: boolean;
	hasRescale: boolean;

	get modifiers(): DifferentialModifier[] {
		return Object.values(this._modifiers);
	}

	get primaries(): number {
		return this._hasPrimaries ? (this._primaries ?? 0) : 0;
	}

	set primaries(value: number) {
		this._primaries = value;
	}

	get hasPrimaries(): boolean {
		return this._hasPrimaries;
	}

	set hasPrimaries(value: boolean) {
		if (value && !this._hasPrimaries) this.material.increment();
		else if (!value && this._hasPrimaries) this.material.decrement();
		this._hasPrimaries = value;
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
		let currentSimulator = this.editor.contextManager.currentSimulator;

		if (Scoring.canChangeNKMedium(currentSimulator, this.getScoringType(), this.keyword))
			return this._medium;

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
		let currentSimulator = this.editor.contextManager.currentSimulator;

		if (Scoring.canChangeMaterialMedium(currentSimulator, this.getScoringType(), this.keyword))
			return this._hasMaterial;

		return false;
	}

	set hasMaterial(hasMaterial: boolean) {
		this._hasMaterial = hasMaterial;
	}

	addModifier(modifier: DifferentialModifier): void {
		this._modifiers[modifier.uuid] = modifier;
	}

	createModifier(): DifferentialModifier {
		const modifier = new DifferentialModifier(
			getQuantityModifiersOptions(
				this.editor.contextManager.currentSimulator,
				this.getScoringType(),
				this.keyword
			)
				.values()
				.next().value
		);
		this.addModifier(modifier);

		return modifier;
	}

	removeModifier(modifier: DifferentialModifier): void {
		delete this._modifiers[modifier.uuid];
	}

	getModifierByUuid(uuid: string): DifferentialModifier | undefined {
		return this._modifiers[uuid];
	}

	getScoringType(): SCORING_TYPE_ENUM {
		return (
			this.editor.scoringManager.getOutputByQuantityUuid(this.uuid)?.scoringType ??
			Scoring.SCORING_TYPE_ENUM.DETECTOR
		);
	}

	constructor(
		editor: YaptideEditor,
		keyword: Scoring.SCORING_KEYWORD = Scoring.SCORING_KEYWORD.Dose
	) {
		super(editor, 'Quantity', 'Quantity');
		this._modifiers = {};

		/**
		 * we need to use the setter
		 * set keyword()
		 * here to trigger the material increment/decrement
		 */
		this.keyword = keyword;
		this.hasFilter = false;
		this.hasMaterial = false;
		this._filter = '';
		this._medium = Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
		this._rescale = 1;
		this.hasRescale = false;
	}

	toSerialized(): ScoringQuantityJSON {
		const { materialUuid, materialPropertiesOverrides, customMaterial, ...json } =
			super.toSerialized();

		let {
			filter,
			primaries,
			hasFilter,
			hasPrimaries,
			hasMaterial,
			keyword,
			modifiers,
			medium,
			rescale
		} = this;

		return {
			...(hasMaterial && {
				materialUuid,
				materialPropertiesOverrides,
				customMaterial
			}),
			...(hasPrimaries && { primaries }),
			...json,
			...(hasFilter && { filter: filter?.uuid }),
			...(medium && { medium }),
			...(rescale !== 1 && { rescale }),
			keyword,
			modifiers: modifiers.map(modifier => modifier.toSerialized())
		};
	}

	fromSerialized(json: ScoringQuantityJSON): this {
		const { filter, medium, rescale, keyword, modifiers, ...basicJSON } = json;
		this._modifiers = modifiers.reduce(
			(acc, curr) => {
				const modifier = DifferentialModifier.fromSerialized(curr);
				acc[modifier.uuid] = modifier;

				return acc;
			},
			{} as Record<string, DifferentialModifier>
		);
		this._primaries = json.primaries ?? null;
		this._hasPrimaries = !!json.primaries;
		this._hasMaterial = !!json.materialUuid;
		super.fromSerialized(basicJSON);
		this.filter = filter ? this.editor.scoringManager.getFilterByUuid(filter) : null;
		this.keyword = keyword;
		this.medium = medium ?? Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
		this.rescale = rescale ?? 1;

		return this;
	}

	static fromSerialized(editor: YaptideEditor, json: ScoringQuantityJSON): ScoringQuantity {
		return new ScoringQuantity(editor).fromSerialized(json);
	}

	duplicate(): ScoringQuantity {
		const duplicated = new ScoringQuantity(this.editor, this.keyword);

		const generatedUuid = duplicated.uuid;
		duplicated.fromSerialized(this.toSerialized());
		duplicated.uuid = generatedUuid;

		return duplicated;
	}
}

export const isScoringQuantity = (x: unknown): x is ScoringQuantity => x instanceof ScoringQuantity;
