import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class HasFilterConfigurationElement implements ConfigurationElement {
	private value: boolean;

	constructor() {
		this.value = false;
	}

	get() {
		return this.value;
	}

	set(value: unknown) {
		this.value = value as boolean;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {}
}
