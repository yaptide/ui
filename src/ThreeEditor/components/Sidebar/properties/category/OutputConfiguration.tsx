import { Object3D } from 'three';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { ConditionalNumberPropertyField } from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { isOutput, ScoringOutput } from '../../../../Simulation/Scoring/ScoringOutput';
import {
	ObjectSelectOptionType,
	ObjectSelectPropertyField
} from '../fields/ObjectSelectPropertyField';
import { useCallback } from 'react';
import { SetOutputSettingsCommand } from '../../../../js/commands/SetOutputSettingsCommand';
import { Grid, Button } from '@mui/material';
import { AddQuantityCommand } from '../../../../js/commands/AddQuantityCommand';

export function OutputConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ScoringOutput);

	const handleChangedDetector = useCallback(
		(v: ObjectSelectOptionType) => {
			editor.execute(
				new SetOutputSettingsCommand(
					editor,
					watchedObject.object,
					'detector',
					editor.detectorManager.getDetectorByUuid(v.uuid)
				)
			);
		},
		[editor, watchedObject]
	);

	const visibleFlag = isOutput(watchedObject);

	return (
		<PropertiesCategory
			category='Output Configuration'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<ObjectSelectPropertyField
						label='Detector'
						value={watchedObject.detector?.uuid ?? ''}
						options={editor.detectorManager.getDetectorOptions(value => {
							return (
								!editor.scoringManager.getTakenDetectors().includes(value.uuid) ||
								value.uuid === watchedObject.detector?.uuid
							);
						})}
						onChange={handleChangedDetector}
					/>

					<ConditionalNumberPropertyField
						label='Primaries'
						precision={0}
						step={1}
						min={0}
						max={1000}
						value={watchedObject.primaries[1] ?? 0}
						enabled={watchedObject.primaries[0]}
						onChange={v => {
							editor.execute(
								new SetOutputSettingsCommand(
									editor,
									watchedObject.object,
									'primaries',
									[true, v]
								)
							);
						}}
						onChangeEnabled={v => {
							editor.execute(
								new SetOutputSettingsCommand(
									editor,
									watchedObject.object,
									'primaries',
									[v, v ? watchedObject.primaries[1] : null]
								)
							);
						}}
					/>
					<Grid
						item
						xs={12}>
						<Button
							sx={{ width: '100%' }}
							variant='contained'
							onClick={() =>
								editor.execute(new AddQuantityCommand(editor, watchedObject.object))
							}>
							Add new quantity
						</Button>
					</Grid>
				</>
			)}
		</PropertiesCategory>
	);
}
