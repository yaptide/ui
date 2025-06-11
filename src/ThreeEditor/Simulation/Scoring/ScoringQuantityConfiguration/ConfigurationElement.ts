import type { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default interface ConfigurationElement {
	set: (value: unknown) => void;
	get: () => unknown;
	applySerialize: (configurator: ScoringQuantityConfigurator) => { [key: string]: any };
	applyDeserialize: (
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	) => void;
}
