import { YaptideEditor } from '../../../js/YaptideEditor';
import * as Scoring from '../ScoringOutputTypes';
import { ScoringQuantity } from '../ScoringQuantity';
import BasicConfigurationElement from './BasicConfigurationElement';
import FilterConfigurationElement from './FilterConfigurationElement';
import MaterialConfigurationElement from './MaterialConfigurationElement';
import MaterialPropertiesOverridesConfigurationElement from './MaterialPropertiesOverridesConfigurationElement';
import MediumConfigurationElement from './MediumConfigurationElement';
import ModifiersConfigurationElement from './ModifiersConfigurationElement';
import PrimariesConfigurationElement from './PrimariesConfigurationElement';
import RescaleConfigurationElement from './RescaleConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';
import SelectedModifierConfigurationElement from './SelectedModifierConfigurationElement';

export function applyShieldHitPreset(
	editor: YaptideEditor,
	scoringQuantity: ScoringQuantity,
	configurator: ScoringQuantityConfigurator
) {
	const scoringOutput = editor.scoringManager.getOutputByName(scoringQuantity.uuid) ?? undefined;

	configurator.add('filter', new FilterConfigurationElement(editor));
	configurator.add('rescale', new RescaleConfigurationElement());
	const keywordElement = new BasicConfigurationElement<string>(
		'keyword',
		scoringOutput?.scoringType ?? Scoring.SCORING_TYPE_ENUM.DETECTOR
	);
	configurator.add('keyword', keywordElement);
	const materialElement = new MaterialConfigurationElement(editor, scoringOutput, keywordElement);
	configurator.add('material', materialElement);
	configurator.add(
		'materialPropertiesOverrides',
		new MaterialPropertiesOverridesConfigurationElement(materialElement)
	);

	configurator.add(
		'medium',
		new MediumConfigurationElement(editor, keywordElement, scoringOutput)
	);

	const modifiersElement = new ModifiersConfigurationElement(
		editor,
		keywordElement,
		scoringOutput
	);
	configurator.add('modifiers', modifiersElement);
	configurator.add(
		'selectedModifier',
		new SelectedModifierConfigurationElement(modifiersElement)
	);
	configurator.add('primaries', new PrimariesConfigurationElement(materialElement));
}
