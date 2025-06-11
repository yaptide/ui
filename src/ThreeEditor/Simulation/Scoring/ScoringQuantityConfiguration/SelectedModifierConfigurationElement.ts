import { DifferentialModifier } from '../ScoringQtyModifiers';
import ConfigurationElement from './ConfigurationElement';
import ModifiersConfigurationElement from './ModifiersConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class SelectedModifierConfigurationElement implements ConfigurationElement {
	private value: string | undefined;
	private modifiersConfig: ModifiersConfigurationElement;

	constructor(modifiersConfig: ModifiersConfigurationElement) {
		this.modifiersConfig = modifiersConfig;
	}

	get() {
		return this.value ? this.modifiersConfig.getByUuid(this.value) : undefined;
	}

	set(value: unknown) {
		this.value = (value as DifferentialModifier | undefined)?.uuid;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {}
}
