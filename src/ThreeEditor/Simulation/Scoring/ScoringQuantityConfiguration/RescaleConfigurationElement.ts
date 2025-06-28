import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class RescaleConfigurationElement implements ConfigurationElement {
	private value: number;
	private hasRescale: boolean;

	constructor() {
		this.value = 1;
		this.hasRescale = false;
	}

	setEnabled(enabled: boolean) {
		this.hasRescale = enabled;
	}

	isEnabled() {
		return this.hasRescale;
	}

	get() {
		return this.hasRescale ? this.value : 1;
	}

	set(value: unknown) {
		this.value = value as number;
		this.hasRescale ||= this.value !== 1;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return {
			hasRescale: this.hasRescale,
			...(this.hasRescale ? { rescale: this.value } : {})
		};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.hasRescale = json.hasRescale;
		this.value = this.hasRescale && !!json.rescale ? json.rescale : 1;
	}
}
