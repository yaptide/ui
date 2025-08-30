import { Button } from '@mui/material';

import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function SimulatorChangeDialog({
	onClose,
	text,
	closeAction,
	confirmAction
}: ConcreteDialogProps<{
	text: string;
	closeAction: () => void;
	confirmAction: () => void;
}>) {
	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='Simulator Change Alert'
			contentText={text}>
			<Button
				onClick={() => {
					closeAction();
					onClose();
				}}
				color='secondary'
				autoFocus>
				Cancel
			</Button>
			<Button
				variant='contained'
				color='secondary'
				onClick={() => {
					confirmAction();
					onClose();
				}}>
				I'm aware
			</Button>
		</CustomDialog>
	);
}
