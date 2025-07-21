import SimulationMaterial from '../../Materials/SimulationMaterial';
import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class PrimariesConfigurationElement implements ConfigurationElement {
	private value: number | null;
	private hasPrimaries: boolean;
	private readonly simulationMaterialConfig: ConfigurationElement;

	constructor(simulationMaterialConfig: ConfigurationElement) {
		this.value = null;
		this.hasPrimaries = false;
		this.simulationMaterialConfig = simulationMaterialConfig;
	}

	setEnabled(enabled: boolean) {
		const material = this.simulationMaterialConfig.get() as SimulationMaterial;

		if (enabled && !this.hasPrimaries) material.increment();
		else if (!enabled && this.hasPrimaries) material.decrement();
		this.hasPrimaries = enabled;
	}

	isEnabled(): boolean {
		return this.hasPrimaries;
	}

	get() {
		return this.hasPrimaries ? (this.value ?? 0) : 0;
	}

	set(value: unknown) {
		this.value = value as number | null;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return this.hasPrimaries ? { primaries: this.value } : {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.hasPrimaries = !!json.primaries;
		this.value = json.primaries ?? null;
	}
}
