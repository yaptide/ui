import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class BasicConfigurationElement<T extends string | number | boolean>
	implements ConfigurationElement
{
	private readonly name: string;
	private value: T;

	constructor(name: string, value: T) {
		this.name = name;
		this.value = value;
	}

	setEnabled(value: boolean): void {
		throw new Error('Element cannot be disabled');
	}

	isEnabled(): boolean {
		return true;
	}

	get() {
		return this.value;
	}

	set(value: unknown) {
		this.value = value as T;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return { [this.name]: this.value };
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.value = json[this.name];
	}
}
