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
		Scoring.SCORING_KEYWORD.Dose
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

export function applyGeant4Preset(
	editor: YaptideEditor,
	scoringQuantity: ScoringQuantity,
	configurator: ScoringQuantityConfigurator
) {
	configurator.add('filter', new FilterConfigurationElement(editor));
	configurator.add(
		'keyword',
		new BasicConfigurationElement<string>('keyword', Scoring.SCORING_KEYWORD.DoseGy)
	);

	configurator.add(
		'histogramNBins',
		new BasicConfigurationElement<number>('histogramNBins', 100)
	);
	configurator.add('histogramMin', new BasicConfigurationElement<number>('histogramMin', 0));
	configurator.add('histogramMax', new BasicConfigurationElement<number>('histogramMax', 1000));
	configurator.add(
		'histogramUnit',
		new BasicConfigurationElement<string>('histogramUnit', 'MeV')
	);

	configurator.add(
		'histogramXScale',
		new BasicConfigurationElement<string>('histogramXScale', 'none')
	);

	configurator.add(
		'histogramXBinScheme',
		new BasicConfigurationElement<string>('histogramXBinScheme', 'linear')
	);
}
