import { YaptideEditor } from '../../../js/YaptideEditor';
import { ScoringOutput } from '../ScoringOutput';
import * as Scoring from '../ScoringOutputTypes';
import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class MediumConfigurationElement implements ConfigurationElement {
	private value: Scoring.MEDIUM | undefined;
	private readonly editor: YaptideEditor;
	private readonly keywordConfig: ConfigurationElement;
	private readonly scoringOutput: ScoringOutput | undefined;

	constructor(
		editor: YaptideEditor,
		keywordConfig: ConfigurationElement,
		scoringOutput?: ScoringOutput
	) {
		this.value = Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
		this.editor = editor;
		this.keywordConfig = keywordConfig;
		this.scoringOutput = scoringOutput;
	}

	setEnabled(enabled: boolean): void {
		throw new Error('Element cannot be disabled');
	}

	isEnabled(): boolean {
		return true;
	}

	get() {
		const currentSimulator = this.editor.contextManager.currentSimulator;
		const scoringType = this.scoringOutput?.scoringType ?? Scoring.SCORING_TYPE_ENUM.DETECTOR;

		if (
			Scoring.canChangeNKMedium(
				currentSimulator,
				scoringType,
				this.keywordConfig.get() as Scoring.SCORING_KEYWORD
			)
		)
			return this.value;

		return null;
	}

	set(value: unknown) {
		this.value = (value as Scoring.MEDIUM) ?? Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		const medium = this.get();

		return medium ? { medium } : {};
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.value = json.medium ?? Scoring.MEDIUM_KEYWORD_OPTIONS.WATER;
	}
}
