import { Button } from '@mui/material';

import { CustomDialog, WarnDialogProps } from './CustomDialog';

export function NewProjectDialog(props: WarnDialogProps) {
	return (
		<CustomDialog
			open={props.open}
			onClose={props.onCancel}
			title='Create a new project'
			contentText='Your current project will be lost. Are you sure you want to continue?'>
			<Button
				onClick={props.onCancel}
				autoFocus>
				Cancel
			</Button>
			<Button onClick={props.onConfirm}>Clear and Proceed</Button>
		</CustomDialog>
	);
}
