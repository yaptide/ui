import { YaptideEditor } from '../../../js/YaptideEditor';
import {
	getDefaultMaterialPropertiesOverrides,
	MaterialOverridable,
	OverrideMap,
	PropertyOverride,
	SimulationZoneJSON
} from '../../Base/SimulationZone';
import SimulationMaterial from '../../Materials/SimulationMaterial';
import { ScoringOutput } from '../ScoringOutput';
import * as Scoring from '../ScoringOutputTypes';
import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class MaterialConfigurationElement implements ConfigurationElement {
	private editor: YaptideEditor;
	private hasMaterial: boolean;
	private scoringOutput: ScoringOutput | undefined;
	private keywordConfig: ConfigurationElement;
	private material: SimulationMaterial;
	private _materialPropertiesOverrides: OverrideMap;
	private usingCustomMaterial: boolean;

	constructor(
		editor: YaptideEditor,
		scoringOutput: ScoringOutput | undefined,
		keywordConfig: ConfigurationElement
	) {
		this.editor = editor;
		this.scoringOutput = scoringOutput;
		this.keywordConfig = keywordConfig;
		this.hasMaterial = false;
		this.material = editor.materialManager.defaultMaterial;
		this.usingCustomMaterial = false;
		this._materialPropertiesOverrides = {
			...getDefaultMaterialPropertiesOverrides(this.material).materialPropertiesOverrides
		};
	}

	private isSomePropertyOverridden(): boolean {
		return Object.values<PropertyOverride>(this._materialPropertiesOverrides).some(
			({ override }) => override
		);
	}

	setEnabled(enabled: boolean): void {
		this.hasMaterial = enabled;
	}

	isEnabled(): boolean {
		const currentSimulator = this.editor.contextManager.currentSimulator;
		const scoringType = this.scoringOutput?.scoringType ?? Scoring.SCORING_TYPE_ENUM.DETECTOR;

		if (
			Scoring.canChangeMaterialMedium(
				currentSimulator,
				scoringType,
				this.keywordConfig.get() as Scoring.SCORING_KEYWORD
			)
		)
			return this.hasMaterial;

		return false;
	}

	set materialPropertiesOverrides(overrides: OverrideMap) {
		this._materialPropertiesOverrides = {
			...overrides
		};

		const isCurrentlyUsingCustomMaterial: boolean = this.isSomePropertyOverridden();

		if (isCurrentlyUsingCustomMaterial !== this.usingCustomMaterial) {
			this.usingCustomMaterial = isCurrentlyUsingCustomMaterial;

			if (this.usingCustomMaterial) this.material.decrement();
			else this.material.increment();
		}
	}

	get materialPropertiesOverrides(): OverrideMap {
		return this._materialPropertiesOverrides;
	}

	set simulationMaterial(value: SimulationMaterial) {
		this.materialPropertiesOverrides = {
			...getDefaultMaterialPropertiesOverrides(this.material).materialPropertiesOverrides
		};
		this.material.decrement();
		this.material = value as SimulationMaterial;
		this.material.increment();
	}

	get() {
		return this.material;
	}

	set(value: unknown) {
		this.simulationMaterial = value as SimulationMaterial;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		const customMaterial = this.usingCustomMaterial
			? {
					...this.material.clone().toSerialized(),
					originalMaterialUuid: this.material.uuid
				}
			: undefined;

		const { uuid: materialUuid } = this.usingCustomMaterial ? customMaterial! : this.material;

		const materialPropertiesOverrides = Object.entries(
			this._materialPropertiesOverrides
		).reduce<Partial<MaterialOverridable>>((acc, [key, { override, value }]) => {
			return {
				...acc,
				...(override && { [key]: value })
			};
		}, {});

		return this.hasMaterial
			? { materialUuid, materialPropertiesOverrides, customMaterial }
			: {};
	}

	private reconstructMaterialFromJSON(json: SimulationZoneJSON) {
		const { materialUuid, customMaterial } = json;
		const simulationMaterial = materialUuid
			? this.editor.materialManager.getMaterialByUuid(
					customMaterial && materialUuid === customMaterial.uuid
						? customMaterial.originalMaterialUuid
						: materialUuid
				)
			: this.editor.materialManager.defaultMaterial;

		if (simulationMaterial === undefined) throw new Error('SimulationMaterial not found');
		this.simulationMaterial = simulationMaterial;
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.reconstructMaterialFromJSON(json as SimulationZoneJSON);
		this.materialPropertiesOverrides = {
			...Object.entries(json['materialPropertiesOverrides'] ?? {}).reduce<OverrideMap>(
				(acc, [key, value]) => {
					return {
						...acc,
						[key]: {
							override: true,
							value
						}
					};
				},
				{
					...getDefaultMaterialPropertiesOverrides(this.material)
						.materialPropertiesOverrides
				}
			)
		};
	}
}
