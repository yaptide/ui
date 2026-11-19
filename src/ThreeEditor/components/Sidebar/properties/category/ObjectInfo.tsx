import { Grid } from '@mui/material';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { useNameEditing } from '../../../../../util/hooks/useNameEditing';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isBeam } from '../../../../Simulation/Physics/Beam';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import { TextPropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectInfo(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);
	const nameEditing = useNameEditing(editor, watchedObject.object, watchedObject.name);

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
						value={nameEditing.value}
						onChange={nameEditing.onChange}
						onBlur={nameEditing.onBlur}
						onKeyDown={nameEditing.onKeyDown}
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
