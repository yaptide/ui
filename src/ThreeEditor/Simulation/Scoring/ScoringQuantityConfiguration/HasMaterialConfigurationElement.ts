import { YaptideEditor } from '../../../js/YaptideEditor';
import { ScoringOutput } from '../ScoringOutput';
import * as Scoring from '../ScoringOutputTypes';
import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class HasMaterialConfigurationElement implements ConfigurationElement {
	private editor: YaptideEditor;
	private scoringOutput: ScoringOutput | undefined;
	private keywordConfig: ConfigurationElement;
	private value: Scoring.SCORING_TYPE_ENUM | undefined;

	constructor(
		editor: YaptideEditor,
		scoringOutput: ScoringOutput | undefined,
		keywordConfig: ConfigurationElement
	) {
		this.editor = editor;
		this.scoringOutput = scoringOutput;
		this.keywordConfig = keywordConfig;
		this.value = scoringOutput?.scoringType ?? Scoring.SCORING_TYPE_ENUM.DETECTOR;
	}

	get() {
		const currentSimulator = this.editor.contextManager.currentSimulator;
		const scoringType = this.scoringOutput?.scoringType ?? Scoring.SCORING_TYPE_ENUM.DETECTOR;

		if (
			Scoring.canChangeMaterialMedium(
				currentSimulator,
				scoringType,
				this.keywordConfig.get() as Scoring.SCORING_KEYWORD
			)
		)
			return this.value;

		return false;
	}

	set(value: unknown) {
		this.value = value as Scoring.SCORING_TYPE_ENUM;
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return { keyword: this.value };
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.value = json.keyword;
	}
}
