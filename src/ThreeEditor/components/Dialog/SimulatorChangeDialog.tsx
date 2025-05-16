import { Button } from '@mui/material';
import { DialogProps } from '@toolpad/core/useDialogs';

import { CustomDialog } from './CustomDialog';

export function SimulatorChangeDialog({ payload, open, onClose }: DialogProps<string, boolean>) {
	return (
		<CustomDialog
			open={open}
			onClose={() => onClose(false)}
			alert={true}
			title='Simulator Change Alert'
			contentText={payload}>
			<Button
				onClick={() => {
					onClose(false);
				}}
				autoFocus>
				Cancel
			</Button>
			<Button
				onClick={() => {
					onClose(true);
				}}>
				I'm aware
			</Button>
		</CustomDialog>
	);
}
