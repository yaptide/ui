import { Button } from '@mui/material';

import { StoreContext } from '../../../services/StoreService';
import { CommonScoringOutput } from '../../Simulation/Scoring/CommonScoringOutput';
import { SCORING_TYPE_ENUM } from '../../Simulation/Scoring/ScoringOutputTypes';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function ChangeScoringTypeDialog({
	onClose,
	yaptideEditor,
	scoringOutput,
	newAlignment,
	setScoringType
}: ConcreteDialogProps<
	Required<Pick<StoreContext, 'yaptideEditor'>> & { scoringOutput: CommonScoringOutput } & {
		newAlignment: SCORING_TYPE_ENUM;
	} & { setScoringType: (scoringType: SCORING_TYPE_ENUM) => void }
>) {
	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='Warning: Change Scoring Type'
			contentText='Changing scoring type will remove quantities and their configurations. Are you sure you want to continue?'>
			<Button
				onClick={onClose}
				autoFocus>
				Cancel
			</Button>
			<Button
				onClick={() => {
					onClose();

					if (scoringOutput && yaptideEditor) {
						scoringOutput.removeAllQuantities();

						if (newAlignment === SCORING_TYPE_ENUM.ZONE) {
							setScoringType(SCORING_TYPE_ENUM.ZONE);
							scoringOutput.scoringType = SCORING_TYPE_ENUM.ZONE;
						} else if (newAlignment === SCORING_TYPE_ENUM.DETECTOR) {
							setScoringType(SCORING_TYPE_ENUM.DETECTOR);
							scoringOutput.scoringType = SCORING_TYPE_ENUM.DETECTOR;
						}
					}
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
