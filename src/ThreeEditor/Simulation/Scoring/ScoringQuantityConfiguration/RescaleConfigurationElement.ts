import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class RescaleConfigurationElement implements ConfigurationElement {
	private value: number;
	private readonly hasRescaleConfig: ConfigurationElement;

	constructor(hasRescaleConfig: ConfigurationElement) {
		this.value = 1;
		this.hasRescaleConfig = hasRescaleConfig;
	}

	get() {
		return this.hasRescaleConfig.get() ? this.value : 1;
	}

	set(value: unknown) {
		this.value = value as number;
		this.hasRescaleConfig.set(this.hasRescaleConfig.get() || this.value !== 1);
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return { rescale: this.value };
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.value = json.rescale;
	}
}
