import { Button } from '@mui/material';

import { CustomDialog, WarnDialogProps } from './CustomDialog';

export function LoadFileDialog(props: WarnDialogProps & { validVersion: boolean }) {
	return (
		<CustomDialog
			open={props.open}
			onClose={props.onCancel}
			title='Load file - Warning'
			contentText={`Loaded data will replace current project data. Are you sure you want to continue?${
				props.validVersion
					? ''
					: ' The file was created with an older version of the editor. It may not load correctly.'
			}`}>
			<Button
				onClick={props.onCancel}
				autoFocus>
				Cancel
			</Button>
			<Button onClick={props.onConfirm}>Clear and Proceed</Button>
		</CustomDialog>
	);
}
