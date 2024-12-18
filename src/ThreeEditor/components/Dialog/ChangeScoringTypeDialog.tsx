import { Button } from '@mui/material';

import { StoreContext } from '../../../services/StoreService';
import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function ChangeScoringTypeDialog({
	onClose,
	yaptideEditor,
	scoringOutput,
	newAlignment,
	setScoringType
}: ConcreteDialogProps<
	Required<Pick<StoreContext, 'yaptideEditor'>> & { scoringOutput: ScoringOutput } & {
		newAlignment: string | null;
	} & { setScoringType: (scoringType: string) => void }
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
					scoringOutput.zone = null;
					scoringOutput.detector = null;

					if (scoringOutput && yaptideEditor) {
						scoringOutput.removeAllQuantities();

						if (newAlignment === 'zone') {
							setScoringType('zone');
							scoringOutput.scoringType = 'zone';
						} else if (newAlignment === 'detector') {
							setScoringType('detector');
							scoringOutput.scoringType = 'detector';
						}
					}
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
