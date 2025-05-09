import { Button, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Object3D } from 'three';

import { useDialog } from '../../../../../services/DialogService';
import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { AddQuantityCommand } from '../../../../js/commands/AddQuantityCommand';
import { SetOutputSettingsCommand } from '../../../../js/commands/SetOutputSettingsCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isOutput, ScoringOutput } from '../../../../Simulation/Scoring/ScoringOutput';
import { SCORING_TYPE_ENUM } from '../../../../Simulation/Scoring/ScoringOutputTypes';
import {
	ObjectSelectOptionType,
	ObjectSelectPropertyField
} from '../fields/ObjectSelectPropertyField';
import { PropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function OutputConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;
	const { open: changeScoringType } = useDialog('changeScoringType');
	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as ScoringOutput
	);

	const [scoringType, setScoringType] = useState(
		watchedObject.scoringType ?? SCORING_TYPE_ENUM.DETECTOR
	);

	useEffect(() => {
		// needed to properly set the scoring type, useState above is not enough
		setScoringType(watchedObject.scoringType ?? SCORING_TYPE_ENUM.DETECTOR);
	}, [watchedObject.scoringType]);

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

	const handleChangedZone = useCallback(
		(v: ObjectSelectOptionType) => {
			editor.execute(
				new SetOutputSettingsCommand(
					editor,
					watchedObject.object,
					'zone',
					editor.zoneManager.getZoneByUuid(v.uuid)
				)
			);
		},
		[editor, watchedObject]
	);

	const handleChangeOutputType = (
		event: React.MouseEvent<HTMLElement>,
		newAlignment: SCORING_TYPE_ENUM
	) => {
		if (watchedObject.quantities.length > 0) {
			changeScoringType({
				yaptideEditor: editor,
				scoringOutput: watchedObject,
				newAlignment: newAlignment,
				setScoringType: setScoringType
			});
			setScoringType(scoringType); // required for toggle component to work properly
		} else {
			if (newAlignment === SCORING_TYPE_ENUM.ZONE) {
				setScoringType(SCORING_TYPE_ENUM.ZONE);
				watchedObject.scoringType = SCORING_TYPE_ENUM.ZONE;
			} else if (newAlignment === SCORING_TYPE_ENUM.DETECTOR) {
				setScoringType(SCORING_TYPE_ENUM.DETECTOR);
				watchedObject.scoringType = SCORING_TYPE_ENUM.DETECTOR;
			}
		}
	};

	const visibleFlag = isOutput(watchedObject);

	return (
		<PropertiesCategory
			category='Output Configuration'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField
						label='Scoring Type'
						disabled={false}>
						<ToggleButtonGroup
							value={scoringType}
							exclusive
							onChange={handleChangeOutputType}
							aria-label='scoring type'
							size='small'>
							<ToggleButton
								value={SCORING_TYPE_ENUM.DETECTOR}
								disabled={scoringType === SCORING_TYPE_ENUM.DETECTOR}
								aria-label='left aligned'>
								Detector
							</ToggleButton>

							<ToggleButton
								value={SCORING_TYPE_ENUM.ZONE}
								disabled={scoringType === SCORING_TYPE_ENUM.ZONE}
								aria-label='left aligned'>
								Zone
							</ToggleButton>
						</ToggleButtonGroup>
					</PropertyField>

					{scoringType === SCORING_TYPE_ENUM.DETECTOR && (
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

					{scoringType === SCORING_TYPE_ENUM.ZONE && (
						<ObjectSelectPropertyField
							label='Zone'
							value={watchedObject.zone?.uuid ?? ''}
							options={editor.zoneManager.getZoneOptionsForScoring()}
							onChange={handleChangedZone}
						/>
					)}
					<Grid size={12}>
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
