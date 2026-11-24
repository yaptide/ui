import { Button, Grid, ToggleButton } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Object3D } from 'three';

import { useDialog } from '../../../../../services/DialogService';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { AddQuantityCommand } from '../../../../js/commands/AddQuantityCommand';
import { SetOutputSettingsCommand } from '../../../../js/commands/SetOutputSettingsCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	CommonScoringOutput,
	isCommonOutput
} from '../../../../Simulation/Scoring/CommonScoringOutput';
import { SCORING_TYPE_ENUM } from '../../../../Simulation/Scoring/ScoringOutputTypes';
import {
	ObjectSelectOptionType,
	ObjectSelectPropertyField
} from '../fields/ObjectSelectPropertyField';
import { LabelledExclusiveToggleButtonGroup, PropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function CommonOutputConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;
	const { open: changeScoringType } = useDialog('changeScoringType');
	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as CommonScoringOutput
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

			editor.signals.objectChanged.dispatch(watchedObject.object, 'scoringType');
		}
	};

	const visibleFlag = isCommonOutput(watchedObject);

	return (
		<PropertiesCategory
			category='Output Configuration'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField
						label='Scoring Type'
						disabled={false}>
						<LabelledExclusiveToggleButtonGroup
							value={scoringType}
							onChange={handleChangeOutputType}
							size='small'>
							<ToggleButton
								value={SCORING_TYPE_ENUM.DETECTOR}
								disabled={scoringType === SCORING_TYPE_ENUM.DETECTOR}>
								Detector
							</ToggleButton>

							<ToggleButton
								value={SCORING_TYPE_ENUM.ZONE}
								disabled={scoringType === SCORING_TYPE_ENUM.ZONE}>
								Zone
							</ToggleButton>
						</LabelledExclusiveToggleButtonGroup>
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
