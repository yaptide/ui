import { YaptideEditor } from '../../../js/YaptideEditor';
import { ScoringFilter } from '../ScoringFilter';
import ConfigurationElement from './ConfigurationElement';
import HasFilterConfigurationElement from './HasFilterConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class BasicConfigurationElement implements ConfigurationElement {
	private editor: YaptideEditor;
	private hasFilterConfig: HasFilterConfigurationElement;
	private value: string | null;

	constructor(editor: YaptideEditor, hasFilterConfig: HasFilterConfigurationElement) {
		this.editor = editor;
		this.hasFilterConfig = hasFilterConfig;
		this.value = null;
	}

	get() {
		return this.hasFilterConfig.get()
			? this.editor.scoringManager.getFilterByUuid(this.value ?? '')
			: null;
	}

	set(value: unknown) {
		this.value = (value as ScoringFilter | null)?.uuid ?? '';
		this.hasFilterConfig.set(!!this.value.length);
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return this.hasFilterConfig.get() ? { filter: this.value } : {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.set(json.filter ? this.editor.scoringManager.getFilterByUuid(json.filter) : null);
	}
}
