import { AddDifferentialModifierCommand } from '../../../../js/commands/AddDifferentialModifierCommand';
import { Button } from '@mui/material';
import {
	DETECTOR_MODIFIERS,
	DETECTOR_MODIFIERS_OPTIONS
} from '../../../../Simulation/Scoring/ScoringOutputTypes';
import {
	DifferentialConfigurationField,
	ModifiersOutlinerField,
	PropertyField
} from '../fields/PropertyField';
import { DifferentialModifier } from '../../../../Simulation/Scoring/ScoringQtyModifiers';
import { Object3D } from 'three';
import { PropertiesCategory } from './PropertiesCategory';
import { RemoveDifferentialModifierCommand } from '../../../../js/commands/RemoveDifferentialModifierCommand';
import { ScoringQuantity, isQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';

export function QuantityDifferentialScoring(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ScoringQuantity);

	const visibleFlag = isQuantity(watchedObject);

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
								if (watchedObject.modifiers.length >= 2) return;
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
							options={DETECTOR_MODIFIERS_OPTIONS}
							onChange={v => {
								editor.execute(
									new AddDifferentialModifierCommand(
										editor,
										watchedObject.object,
										DifferentialModifier.fromJSON({
											uuid: watchedObject.selectedModifier!.uuid,
											diffType: v.keywordSelect as DETECTOR_MODIFIERS,
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
