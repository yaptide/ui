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

	// @see ConfigurationPresets.applyShieldHitPreset
	keyword?: Scoring.SCORING_KEYWORD;
	hasFilter?: boolean;
	filter?: ScoringFilter;
	hasPrimaries?: boolean;
	primaries?: number;
	hasRescale?: boolean;
	rescale?: number;
	selectedModifier?: DifferentialModifier | undefined;
	medium?: Scoring.MEDIUM | null;
	modifiers?: DifferentialModifier[];
	hasMaterial?: boolean;
	material?: SimulationMaterial | undefined;
	materialPropertiesOverrides?: OverrideMap;

	addModifier(modifier: DifferentialModifier): void {
		const modifiers = this._configurator.raw('modifiers') as ModifiersConfigurationElement;
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

	private upCaseFirst(s: string) {
		return s.substring(0, 1).toUpperCase() + s.substring(1);
	}

	constructor(editor: YaptideEditor) {
		super(editor, 'Quantity', 'Quantity');
		this._configurator = new ScoringQuantityConfigurator();
		applyShieldHitPreset(editor, this, this._configurator);

		for (const key of this._configurator.keys()) {
			// add getters and setters for properties i.e `foo`
			Object.defineProperty(this, key, {
				get: () => this._configurator.get(key),
				set: (value: any) => this._configurator.set(key, value)
			});

			// add getters and setters for property toggles i.e `hasFoo`
			Object.defineProperty(this, `has${this.upCaseFirst(key)}`, {
				get: () => this._configurator.isEnabled(key),
				set: (value: boolean) => this._configurator.setEnabled(key, value)
			});
		}
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
		const duplicated = new ScoringQuantity(this.editor);

		const generatedUuid = duplicated.uuid;
		duplicated.fromSerialized(this.toSerialized());
		duplicated.uuid = generatedUuid;

		return duplicated;
	}
}

export const isScoringQuantity = (x: unknown): x is ScoringQuantity => x instanceof ScoringQuantity;
