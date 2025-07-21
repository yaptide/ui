import type { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default interface ConfigurationElement {
	set: (value: unknown) => void;
	get: () => unknown;
	setEnabled: (enabled: boolean) => void;
	isEnabled: () => boolean;
	applySerialize: (configurator: ScoringQuantityConfigurator) => { [key: string]: any };
	applyDeserialize: (
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	) => void;
}
