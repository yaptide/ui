import { SerializableState } from '../../../js/EditorJson';
import ConfigurationElement from './ConfigurationElement';

export class ScoringQuantityConfigurator implements SerializableState<object> {
	private configuration: { [key: string]: ConfigurationElement };

	constructor() {
		this.configuration = {};
	}

	keys(): string[] {
		return Object.keys(this.configuration);
	}

	add(name: string, configuration: ConfigurationElement) {
		this.configuration[name] = configuration;
	}

	isEnabled(name: string) {
		return this.configuration.hasOwnProperty(name) && this.configuration[name].isEnabled();
	}

	setEnabled(name: string, enabled: boolean) {
		if (!this.configuration.hasOwnProperty(name)) {
			throw new Error(`Unknown configuration option "${name}"`);
		}

		this.configuration[name].setEnabled(enabled);
	}

	set(name: string, value: unknown) {
		if (!this.configuration.hasOwnProperty(name)) {
			throw new Error(`Unknown configuration option "${name}"`);
		}

		this.configuration[name].set(value);
	}

	get(name: string): unknown {
		if (!this.configuration.hasOwnProperty(name)) {
			throw new Error(`Unknown configuration option "${name}"`);
		}

		return this.configuration[name].get();
	}

	raw(name: string): ConfigurationElement {
		if (!this.configuration.hasOwnProperty(name)) {
			throw new Error(`Unknown configuration option "${name}"`);
		}

		return this.configuration[name];
	}

	toSerialized(): object {
		let json = {};

		for (const conf of Object.values(this.configuration)) {
			json = { ...json, ...conf.applySerialize(this) };
		}

		return json;
	}

	fromSerialized(state: object): this {
		for (const conf of Object.values(this.configuration)) {
			conf.applyDeserialize(this, state);
		}

		return this;
	}
}
