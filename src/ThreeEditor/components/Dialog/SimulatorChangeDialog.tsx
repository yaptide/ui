import { Button } from '@mui/material';

import { testIds } from '../../../util/testIds';
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
			testId='simulator-change'
			title='Simulator Change Alert'
			contentText={text}>
			<Button
				data-testid={`${testIds.dialog('simulator-change')}-cancel`}
				onClick={() => {
					closeAction();
					onClose();
				}}
				color='secondary'
				autoFocus>
				Cancel
			</Button>
			<Button
				data-testid={`${testIds.dialog('simulator-change')}-confirm`}
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
