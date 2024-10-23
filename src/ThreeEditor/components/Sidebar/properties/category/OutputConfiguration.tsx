import { Button, Grid } from '@mui/material';
import { useCallback } from 'react';
import { Object3D } from 'three';

import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { AddQuantityCommand } from '../../../../js/commands/AddQuantityCommand';
import { SetOutputSettingsCommand } from '../../../../js/commands/SetOutputSettingsCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isOutput, ScoringOutput } from '../../../../Simulation/Scoring/ScoringOutput';
import {
	ObjectSelectOptionType,
	ObjectSelectPropertyField
} from '../fields/ObjectSelectPropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function OutputConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as ScoringOutput
	);

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
