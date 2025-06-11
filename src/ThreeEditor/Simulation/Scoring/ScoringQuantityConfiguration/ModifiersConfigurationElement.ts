import { YaptideEditor } from '../../../js/YaptideEditor';
import { ScoringOutput } from '../ScoringOutput';
import { getQuantityModifiersOptions } from '../ScoringOutputTypes';
import * as Scoring from '../ScoringOutputTypes';
import { DifferentialJSON, DifferentialModifier } from '../ScoringQtyModifiers';
import ConfigurationElement from './ConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

export default class ModifiersConfigurationElement implements ConfigurationElement {
	private modifiers: Record<string, DifferentialModifier>;
	private readonly editor: YaptideEditor;
	private readonly keywordConfig: ConfigurationElement;
	private readonly scoringOutput: ScoringOutput | undefined;

	constructor(
		editor: YaptideEditor,
		keywordConfig: ConfigurationElement,
		scoringOutput?: ScoringOutput
	) {
		this.modifiers = {};
		this.editor = editor;
		this.keywordConfig = keywordConfig;
		this.scoringOutput = scoringOutput;
	}

	get() {
		return Object.values(this.modifiers);
	}

	getByUuid(uuid: string): DifferentialModifier | undefined {
		return this.modifiers[uuid];
	}

	set(value: unknown) {
		throw new Error('Method not implemented; use create(), add() and remove()');
	}

	create() {
		const scoringType = this.scoringOutput?.scoringType ?? Scoring.SCORING_TYPE_ENUM.DETECTOR;

		const modifier = new DifferentialModifier(
			getQuantityModifiersOptions(
				this.editor.contextManager.currentSimulator,
				scoringType,
				this.keywordConfig.get() as Scoring.SCORING_KEYWORD
			)
				.values()
				.next().value
		);
		this.add(modifier);

		return modifier;
	}

	add(modifier: DifferentialModifier): void {
		this.modifiers[modifier.uuid] = modifier;
	}

	remove(modifier: DifferentialModifier): void {
		delete this.modifiers[modifier.uuid];
	}

	applySerialize(configurator: ScoringQuantityConfigurator) {
		return { modifiers: this.get().map(modifier => modifier.toSerialized()) };
	}

	applyDeserialize(
		configurator: ScoringQuantityConfigurator,
		json: { [key: string]: any }
	): void {
		this.modifiers = (json.modifiers as DifferentialJSON[]).reduce(
			(acc, curr) => {
				const modifier = DifferentialModifier.fromSerialized(curr);
				acc[modifier.uuid] = modifier;

				return acc;
			},
			{} as Record<string, DifferentialModifier>
		);
	}
}
