import { YaptideEditor } from '../../../js/YaptideEditor';
import * as Scoring from '../ScoringOutputTypes';
import { ScoringQuantity } from '../ScoringQuantity';
import BasicConfigurationElement from './BasicConfigurationElement';
import FilterConfigurationElement from './FilterConfigurationElement';
import HasFilterConfigurationElement from './HasFilterConfigurationElement';
import HasMaterialConfigurationElement from './HasMaterialConfigurationElement';
import HasPrimariesConfigurationElement from './HasPrimariesConfigurationElement';
import MaterialPropertiesOverridesConfigurationElement from './MaterialPropertiesOverridesConfigurationElement';
import MediumConfigurationElement from './MediumConfigurationElement';
import ModifiersConfigurationElement from './ModifiersConfigurationElement';
import PrimariesConfigurationElement from './PrimariesConfigurationElement';
import RescaleConfigurationElement from './RescaleConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';
import SelectedModifierConfigurationElement from './SelectedModifierConfigurationElement';
import SimulationMaterialConfigurationElement from './SimulationMaterialConfigurationElement';

export function applyShieldHitPreset(
	editor: YaptideEditor,
	scoringQuantity: ScoringQuantity,
	configurator: ScoringQuantityConfigurator
) {
	const hasFilterElement = new HasFilterConfigurationElement();
	configurator.add('hasFilter', hasFilterElement);
	configurator.add('filter', new FilterConfigurationElement(editor, hasFilterElement));

	const hasRescaleElement = new BasicConfigurationElement<boolean>('hasRescale', false);
	configurator.add('hasRescale', hasRescaleElement);
	configurator.add('rescale', new RescaleConfigurationElement(hasRescaleElement));

	const scoringOutput = editor.scoringManager.getOutputByName(scoringQuantity.uuid) ?? undefined;
	const keywordElement = new BasicConfigurationElement<string>(
		'keyword',
		scoringOutput?.scoringType ?? Scoring.SCORING_TYPE_ENUM.DETECTOR
	);
	configurator.add('keyword', keywordElement);

	const hasMaterialElement = new HasMaterialConfigurationElement(
		editor,
		scoringOutput,
		keywordElement
	);
	configurator.add('hasMaterial', hasMaterialElement);
	const materialElement = new SimulationMaterialConfigurationElement(editor);
	configurator.add('simulationMaterial', materialElement);
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

	const hasPrimariesElement = new HasPrimariesConfigurationElement(materialElement);
	configurator.add('hasPrimaries', hasPrimariesElement);
	configurator.add('primaries', new PrimariesConfigurationElement(hasPrimariesElement));
}
