import { Button } from '@mui/material';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { AddDifferentialModifierCommand } from '../../../../js/commands/AddDifferentialModifierCommand';
import { RemoveDifferentialModifierCommand } from '../../../../js/commands/RemoveDifferentialModifierCommand';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	DETECTOR_MODIFIERS,
	DETECTOR_MODIFIERS_OPTIONS,
	DETECTOR_MODIFIERS_OPTIONS_FLUKA
} from '../../../../Simulation/Scoring/ScoringOutputTypes';
import {
	DifferentialModifier,
	DifferentialModifierFluka,
	DifferentialModifierSH
} from '../../../../Simulation/Scoring/ScoringQtyModifiers';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import {
	DifferentialConfigurationField,
	DifferentialConfigurationFieldFluka,
	ModifiersOutlinerField,
	PropertyField} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function QuantityDifferentialScoring(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;
	const currentSimulator = editor.contextManager.currentSimulator;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as ScoringQuantity
	);

	const visibleFlag = isScoringQuantity(watchedObject);

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
								if (
									(watchedObject.modifiers.length >= 2 &&
										currentSimulator == SimulatorType.SHIELDHIT) ||
									(watchedObject.modifiers.length >= 1 &&
										currentSimulator == SimulatorType.FLUKA)
								)
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
					{watchedObject.selectedModifier &&
						((currentSimulator == SimulatorType.SHIELDHIT && (
							<DifferentialConfigurationField
								keywordSelect={
									(watchedObject.selectedModifier as DifferentialModifierSH)
										.diffType
								}
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
						)) ||
							(currentSimulator == SimulatorType.FLUKA && (
								<DifferentialConfigurationFieldFluka
									keywordSelect={DETECTOR_MODIFIERS_OPTIONS_FLUKA.E}
									volume={
										(
											watchedObject.selectedModifier as DifferentialModifierFluka
										).volume
									}
									lowerLimit={watchedObject.selectedModifier.lowerLimit}
									upperLimit={watchedObject.selectedModifier.upperLimit}
									binsNumber={watchedObject.selectedModifier.binsNumber}
									logCheckbox={watchedObject.selectedModifier.isLog}
									options={DETECTOR_MODIFIERS_OPTIONS_FLUKA}
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
							)))}
				</>
			)}
		</PropertiesCategory>
	);
}
