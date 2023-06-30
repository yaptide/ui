import { Button } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { CustomDialog, WarnDialogProps } from './CustomDialog';

export function NewProjectDialog({ open, onClose, onConfirm = onClose }: WarnDialogProps) {
	const { editorRef } = useStore();
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
					if (editorRef.current) editorRef.current.clear();
					onConfirm();
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
