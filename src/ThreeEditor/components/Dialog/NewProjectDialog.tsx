import { Button } from '@mui/material';

import { YaptideEditor } from '../../js/YaptideEditor';
import { CustomDialog, WarnDialogProps } from './CustomDialog';

export function NewProjectDialog({
	open,
	onClose,
	onConfirm = onClose,
	editor
}: WarnDialogProps<{ editor: YaptideEditor }>) {
	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			alert={true}
			title='New Project Alert'
			contentText='Your current project will be lost. Are you sure you want to continue?'>
			<Button
				onClick={onClose}
				autoFocus>
				Cancel
			</Button>
			<Button
				onClick={() => {
					editor.clear();
					onConfirm();
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
