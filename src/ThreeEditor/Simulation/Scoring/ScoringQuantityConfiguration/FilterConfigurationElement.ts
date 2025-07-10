import { YaptideEditor } from '../../../js/YaptideEditor';
import { ScoringFilter } from '../ScoringFilter';
import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class FilterConfigurationElement implements ConfigurationElement {
	private editor: YaptideEditor;
	private hasFilter: boolean;
	private value: string | null;

	constructor(editor: YaptideEditor) {
		this.editor = editor;
		this.hasFilter = false;
		this.value = null;
	}

	setEnabled(enabled: boolean) {
		this.hasFilter = enabled;
	}

	isEnabled() {
		return this.hasFilter;
	}

	get() {
		return this.hasFilter ? this.editor.scoringManager.getFilterByUuid(this.value ?? '') : null;
	}

	set(value: unknown) {
		this.value = (value as ScoringFilter | null)?.uuid ?? '';
		this.hasFilter = !!this.value.length;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return this.hasFilter ? { filter: this.value } : {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.set(json.filter ? this.editor.scoringManager.getFilterByUuid(json.filter) : null);
	}
}
