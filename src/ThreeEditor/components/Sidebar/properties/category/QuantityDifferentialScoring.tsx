import { Button } from '@mui/material';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { AddDifferentialModifierCommand } from '../../../../js/commands/AddDifferentialModifierCommand';
import { RemoveDifferentialModifierCommand } from '../../../../js/commands/RemoveDifferentialModifierCommand';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	getQuantityModifiersOptions,
	SCORING_MODIFIERS,
	SCORING_TYPE_ENUM
} from '../../../../Simulation/Scoring/ScoringOutputTypes';
import { DifferentialModifier } from '../../../../Simulation/Scoring/ScoringQtyModifiers';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import {
	DifferentialConfigurationField,
	ModifiersOutlinerField,
	PropertyField
} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

const NUMBER_OF_MODIFIERS_SHIELDHIT = 2;
const NUMBER_OF_MODIFIERS_FLUKA = 1;

export function QuantityDifferentialScoring(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as ScoringQuantity
	);

	const visibleFlag = isScoringQuantity(watchedObject);
	let simulatorType: SimulatorType = editor.contextManager.currentSimulator;
	const maxNumberOfModifiers = () => {
		if (simulatorType === SimulatorType.SHIELDHIT) {
			return NUMBER_OF_MODIFIERS_SHIELDHIT;
		} else if (simulatorType === SimulatorType.FLUKA) {
			return NUMBER_OF_MODIFIERS_FLUKA;
		}

		return 0;
	};

	let keyword = watchedObject.keyword;
	let currentSimulator = editor.contextManager.currentSimulator;
	let scoringType: SCORING_TYPE_ENUM = SCORING_TYPE_ENUM.DETECTOR;

	if (isScoringQuantity(watchedObject)) {
		scoringType = watchedObject.getScoringType();
	}

	return (
		<PropertiesCategory
			category='Differential Scoring'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField>
						<Button
							sx={{ width: '100%' }}
							variant='contained'
							onClick={() => {
								if (watchedObject.modifiers.length >= maxNumberOfModifiers())
									return;
								editor.execute(
									new AddDifferentialModifierCommand(editor, watchedObject.object)
								);
							}}>
							Add differential modifier
						</Button>
					</PropertyField>

					<ModifiersOutlinerField
						editor={editor}
						onChange={v => {
							editor.execute(
								new SetQuantityValueCommand(
									editor,
									watchedObject.object,
									'selectedModifier',
									watchedObject.getModifierByUuid(v)
								)
							);
						}}
						value={watchedObject.selectedModifier?.uuid ?? null}
						options={watchedObject.modifiers}
					/>
					{watchedObject.selectedModifier && (
						<DifferentialConfigurationField
							keywordSelect={watchedObject.selectedModifier.diffType}
							lowerLimit={watchedObject.selectedModifier.lowerLimit}
							upperLimit={watchedObject.selectedModifier.upperLimit}
							binsNumber={watchedObject.selectedModifier.binsNumber}
							logCheckbox={watchedObject.selectedModifier.isLog}
							options={Array.from(
								getQuantityModifiersOptions(currentSimulator, scoringType, keyword)
							).reduce(
								(acc, key) => {
									acc[key] = key;

									return acc;
								},
								{} as Record<SCORING_MODIFIERS, SCORING_MODIFIERS>
							)}
							onChange={v => {
								editor.execute(
									new AddDifferentialModifierCommand(
										editor,
										watchedObject.object,
										DifferentialModifier.fromJSON({
											uuid: watchedObject.selectedModifier!.uuid,
											diffType: v.keywordSelect as SCORING_MODIFIERS,
											lowerLimit: v.lowerLimit,
											upperLimit: v.upperLimit,
											binsNumber: v.binsNumber,
											isLog: v.logCheckbox
										})
									)
								);
							}}
							onDelete={() =>
								editor.execute(
									new RemoveDifferentialModifierCommand(
										editor,
										watchedObject.object,
										watchedObject.selectedModifier!
									)
								)
							}
						/>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
