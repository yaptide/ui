import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';
import SimulationMaterialConfigurationElement from './SimulationMaterialConfigurationElement';

export default class MaterialPropertiesOverridesConfigurationElement
	implements ConfigurationElement
{
	private readonly materialConfig;

	constructor(materialConfig: SimulationMaterialConfigurationElement) {
		this.materialConfig = materialConfig;
	}

	get() {
		return this.materialConfig.materialPropertiesOverrides;
	}

	set(value: unknown) {}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {}
}
