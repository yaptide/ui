import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class PrimariesConfigurationElement implements ConfigurationElement {
	private value: number | null;
	private readonly hasPrimariesConfig: ConfigurationElement;

	constructor(hasPrimariesConfig: ConfigurationElement) {
		this.value = null;
		this.hasPrimariesConfig = hasPrimariesConfig;
	}

	get() {
		return this.hasPrimariesConfig.get() ? (this.value ?? 0) : 0;
	}

	set(value: unknown) {
		this.value = value as number | null;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return this.hasPrimariesConfig.get() ? { primaries: this.value } : {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.value = json.primaries ?? null;
	}
}
