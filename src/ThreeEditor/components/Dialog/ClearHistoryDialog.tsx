import { Button } from '@mui/material';

import { CustomDialog, WarnDialogProps } from './CustomDialog';

export function ClearHistoryDialog({ open, onClose, onConfirm }: WarnDialogProps) {
	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			alert={true}
			title='Clear History'
			contentText='The Undo/Redo history will be lost. Are you sure you want to continue?'>
			<Button
				onClick={onClose}
				autoFocus>
				Cancel
			</Button>
			<Button onClick={onConfirm}>Clear and proceed</Button>
		</CustomDialog>
	);
}
