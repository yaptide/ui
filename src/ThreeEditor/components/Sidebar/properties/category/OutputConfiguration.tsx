import { Button, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback, useState } from 'react';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { AddQuantityCommand } from '../../../../js/commands/AddQuantityCommand';
import { SetOutputSettingsCommand } from '../../../../js/commands/SetOutputSettingsCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isOutput, ScoringOutput } from '../../../../Simulation/Scoring/ScoringOutput';
import {
	ObjectSelectOptionType,
	ObjectSelectPropertyField
} from '../fields/ObjectSelectPropertyField';
import { PropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function OutputConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const [isDetector, setIsDetector] = useState(true);
	const { object, editor } = props;
	const simulatorType: SimulatorType = editor.contextManager.currentSimulator;

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

	const handleChangeOutputType = () => {
		setIsDetector(!isDetector);
	};

	const visibleFlag = isOutput(watchedObject);

	return (
		<PropertiesCategory
			category='Output Configuration'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					{simulatorType == SimulatorType.FLUKA && (
						<PropertyField
							label='Scoring Type'
							disabled={false}>
							<ToggleButtonGroup
								value={isDetector.toString()}
								exclusive
								onChange={handleChangeOutputType}
								aria-label='text alignment'
								size='small'>
								<ToggleButton
									value={true.toString()}
									disabled={isDetector}
									aria-label='left aligned'>
									Detector
								</ToggleButton>

								<ToggleButton
									value={false.toString()}
									disabled={!isDetector}
									aria-label='left aligned'>
									Zone
								</ToggleButton>
							</ToggleButtonGroup>
						</PropertyField>
					)}

					{isDetector && (
						<ObjectSelectPropertyField
							label='Detector'
							value={watchedObject.detector?.uuid ?? ''}
							options={editor.detectorManager.getDetectorOptions(value => {
								return (
									!editor.scoringManager
										.getTakenDetectors()
										.includes(value.uuid) ||
									value.uuid === watchedObject.detector?.uuid
								);
							})}
							onChange={handleChangedDetector}
						/>
					)}

					{!isDetector && (
						<ObjectSelectPropertyField
							label='Zone'
							value={watchedObject.detector?.uuid ?? ''}
							options={editor.detectorManager.getDetectorOptions(value => {
								return (
									!editor.scoringManager
										.getTakenDetectors()
										.includes(value.uuid) ||
									value.uuid === watchedObject.detector?.uuid
								);
							})}
							onChange={handleChangedDetector}
						/>
					)}
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
