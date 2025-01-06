import { Button } from '@mui/material';
import { Object3D } from 'three';

import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { AddDifferentialModifierCommand } from '../../../../js/commands/AddDifferentialModifierCommand';
import { RemoveDifferentialModifierCommand } from '../../../../js/commands/RemoveDifferentialModifierCommand';
import { SetQuantityValueCommand } from '../../../../js/commands/SetQuantityValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	DETECTOR_MODIFIERS,
	getQuantityModifiersOptions
} from '../../../../Simulation/Scoring/ScoringOutputTypes';
import { DifferentialModifier } from '../../../../Simulation/Scoring/ScoringQtyModifiers';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import {
	DifferentialConfigurationField,
	ModifiersOutlinerField,
	PropertyField
} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function QuantityDifferentialScoring(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as ScoringQuantity
	);

	const visibleFlag = isScoringQuantity(watchedObject);

	let keyword = watchedObject.keyword;
	let currentSimulator = editor.contextManager.currentSimulator;

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
							options={Array.from(
								getQuantityModifiersOptions(currentSimulator, 'DETECTOR', keyword)
							).reduce(
								(acc, key) => {
									acc[key] = key;

									return acc;
								},
								{} as Record<DETECTOR_MODIFIERS, DETECTOR_MODIFIERS>
							)}
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
