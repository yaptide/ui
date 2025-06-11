import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';
import { OverrideMap } from '../Base/SimulationZone';
import SimulationMaterial from '../Materials/SimulationMaterial';
import { ScoringFilter } from './ScoringFilter';
import * as Scoring from './ScoringOutputTypes';
import { SCORING_TYPE_ENUM } from './ScoringOutputTypes';
import { DifferentialJSON, DifferentialModifier } from './ScoringQtyModifiers';
import { applyShieldHitPreset } from './ScoringQuantityConfiguration/ConfigurationPresets';
import ModifiersConfigurationElement from './ScoringQuantityConfiguration/ModifiersConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfiguration/ScoringQuantityConfigurator';

export type ScoringQuantityJSON = Omit<
	SimulationElementJSON & {
		// ShieldHit
		keyword?: Scoring.SCORING_KEYWORD;
		medium?: Scoring.MEDIUM;
		filter?: string;
		modifiers?: DifferentialJSON[];
		primaries?: number;
		rescale?: number;
	},
	never
>;

export class ScoringQuantity
	extends SimulationElement
	implements SerializableState<ScoringQuantityJSON>
{
	readonly isQuantity: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	private _configurator: ScoringQuantityConfigurator;

	get keyword(): Scoring.SCORING_KEYWORD {
		return this._configurator.get('keyword') as Scoring.SCORING_KEYWORD;
	}

	set keyword(keyword: Scoring.SCORING_KEYWORD) {
		this._configurator.set('keyword', keyword);
	}

	get modifiers(): DifferentialModifier[] {
		return this._configurator.get('modifiers') as DifferentialModifier[];
	}

	get primaries(): number {
		return this._configurator.get('primaries') as number;
	}

	set primaries(value: number) {
		this._configurator.set('primaries', value);
	}

	get hasPrimaries(): boolean {
		return this._configurator.get('hasPrimaries') as boolean;
	}

	set hasPrimaries(value: boolean) {
		this._configurator.set('hasPrimaries', value);
	}

	set selectedModifier(mod: DifferentialModifier | undefined) {
		this._configurator.set('selectedModifier', mod);
	}

	get selectedModifier(): DifferentialModifier | undefined {
		return this._configurator.get('selectedModifier') as DifferentialModifier | undefined;
	}

	set hasFilter(value: boolean) {
		this._configurator.set('hasFilter', value);
	}

	get hasFilter(): boolean {
		return this._configurator.get('hasFilter') as boolean;
	}

	get filter(): ScoringFilter | null {
		return this._configurator.get('filter') as ScoringFilter | null;
	}

	set filter(filter: ScoringFilter | null) {
		this._configurator.set('filter', filter);
	}

	get medium(): Scoring.MEDIUM | null {
		return this._configurator.get('medium') as Scoring.MEDIUM | null;
	}

	set medium(medium: Scoring.MEDIUM | null) {
		this._configurator.set('medium', medium);
	}

	get hasRescale(): boolean {
		return this._configurator.get('hasRescale') as boolean;
	}

	set hasRescale(value: boolean) {
		this._configurator.set('hasRescale', value);
	}

	set rescale(rescale: number) {
		this._configurator.set('rescale', rescale);
	}

	get rescale(): number {
		return this._configurator.get('rescale') as number;
	}

	get hasMaterial(): boolean {
		return this._configurator.get('hasMaterial') as boolean;
	}

	set hasMaterial(hasMaterial: boolean) {
		this._configurator.set('hasMaterial', hasMaterial);
	}

	get material(): SimulationMaterial {
		return this._configurator.get('simulationMaterial') as SimulationMaterial;
	}

	get materialPropertiesOverrides(): OverrideMap {
		return this._configurator.get('materialPropertiesOverrides') as OverrideMap;
	}

	addModifier(modifier: DifferentialModifier): void {
		const modifiers = this._configurator.get('modifiers') as ModifiersConfigurationElement;
		modifiers.add(modifier);
	}

	createModifier(): DifferentialModifier {
		const modifiers = this._configurator.raw('modifiers') as ModifiersConfigurationElement;

		return modifiers.create();
	}

	removeModifier(modifier: DifferentialModifier): void {
		const modifiers = this._configurator.raw('modifiers') as ModifiersConfigurationElement;
		modifiers.remove(modifier);
	}

	getModifierByUuid(uuid: string): DifferentialModifier | undefined {
		const modifiers = this._configurator.raw('modifiers') as ModifiersConfigurationElement;

		return modifiers.getByUuid(uuid);
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
		this._configurator = new ScoringQuantityConfigurator();
		applyShieldHitPreset(editor, this, this._configurator);
	}

	toSerialized(): ScoringQuantityJSON {
		return {
			...super.toSerialized(),
			...this._configurator.toSerialized()
		};
	}

	fromSerialized(json: ScoringQuantityJSON): this {
		super.fromSerialized(json);
		this._configurator.fromSerialized(json);

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
