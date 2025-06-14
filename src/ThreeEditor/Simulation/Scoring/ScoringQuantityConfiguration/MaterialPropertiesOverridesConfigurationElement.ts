import ConfigurationElement from './ConfigurationElement';
import MaterialConfigurationElement from './MaterialConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class MaterialPropertiesOverridesConfigurationElement
	implements ConfigurationElement
{
	private readonly materialConfig;

	constructor(materialConfig: MaterialConfigurationElement) {
		this.materialConfig = materialConfig;
	}

	setEnabled(enabled: boolean) {
		throw new Error('Element cannot be disabled');
	}

	isEnabled(): boolean {
		return true;
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
