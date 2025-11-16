import { Alert, Button } from '@mui/material';

import {
	ConcreteDialogProps,
	CustomDialog
} from '../../../../ThreeEditor/components/Dialog/CustomDialog';

export function DatasetsPartialInfoDialog({ onClose }: ConcreteDialogProps) {
	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='PARTIAL Geant4 Datasets Info'
			contentText={`
				PARTIAL Geant4 datasets option means that during the simulation thousands of small data files
					will be downloaded on-the-fly as needed. It keeps the total download size smaller.
                `}
			body={
				<Alert
					severity='warning'
					sx={{ mt: 2 }}>
					Time of running simulations with PARTIAL datasets option can be
					significantly longer due to frequent downloads of small data files during
					the simulation.
				</Alert>
			}>
			<Button
				onClick={() => {
					onClose();
				}}
				color='secondary'
				variant='contained'
				autoFocus>
				Close
			</Button>
		</CustomDialog>
	);
}
