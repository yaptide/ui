import SimulationMaterial from '../../Materials/SimulationMaterial';
import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class HasPrimariesConfigurationElement implements ConfigurationElement {
	private value: boolean;
	private simulationMaterialConfig: ConfigurationElement;

	constructor(simulationMaterialConfig: ConfigurationElement) {
		this.value = false;
		this.simulationMaterialConfig = simulationMaterialConfig;
	}

	get() {
		return this.value;
	}

	set(value: unknown) {
		const material = this.simulationMaterialConfig.get() as SimulationMaterial;

		if (value && !this.value) material.increment();
		else if (!value && this.value) material.decrement();
		this.value = value as boolean;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.value = !!json.primaries;
	}
}
