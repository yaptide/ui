import { Object3D } from 'three';
import { Editor } from '../../../../js/Editor';
import {
	DifferentialConfigurationField,
	ModifiersOutlinerField,
	PropertyField
} from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { isQuantity, ScoringQuantity } from '../../../../util/Scoring/ScoringQuantity';
import { Button } from '@mui/material';
import { AddDifferentialModifierCommand } from '../../../../js/commands/AddDifferentialModifierCommand';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { DETECTOR_MODIFIERS, DETECTOR_MODIFIERS_OPTIONS } from '../../../../util/Scoring/ScoringOutputTypes';
import { RemoveDifferentialModifierCommand } from '../../../../js/commands/RemoveDifferentialModifierCommand';
import { DifferentialModifier } from '../../../../util/Scoring/ScoringQtyModifiers';

export function QuantityDifferentialScoring(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ScoringQuantity);

	const visibleFlag = isQuantity(watchedObject);

	return (
		<PropertiesCategory category='Differential Scoring' visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField
						field={
							<Button
								sx={{ width: '100%' }}
								variant='contained'
								onClick={() => {
									if (watchedObject.modifiers.length >= 2) return;
									editor.execute(
										new AddDifferentialModifierCommand(
											editor,
											watchedObject.object
										)
									);
								}}>
								Add differential modifier
							</Button>
						}
					/>
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
