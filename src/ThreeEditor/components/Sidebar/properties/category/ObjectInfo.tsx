import { Grid } from '@mui/material';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isBeam } from '../../../../Simulation/Physics/Beam';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import { TextPropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectInfo(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag = !isBeam(watchedObject);
	let scoringType: string | undefined = 'unknown';
	let showScoringType = false;

	if (isScoringQuantity(watchedObject)) {
		scoringType = (watchedObject as ScoringQuantity).getScoringType();
		showScoringType = editor.contextManager.currentSimulator !== SimulatorType.GEANT4;
	}

	return (
		<PropertiesCategory
			category='Information'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<TextPropertyField
						label='Name'
						value={watchedObject.name}
						onChange={value => {
							editor.execute(
								new SetValueCommand(
									editor,
									watchedObject.object,
									'name',
									value.length > 0 ? value : watchedObject.type
								)
							);
						}}
					/>
					{showScoringType && (
						<>
							<Grid
								size={4}
								sx={{ textAlign: 'right' }}>
								{'Scoring Type'}
							</Grid>
							<Grid size={8}>{scoringType}</Grid>
						</>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
