import { Button } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { CustomDialog, WarnDialogProps } from './CustomDialog';

export function ClearHistoryDialog({ open, onClose, onConfirm = onClose }: WarnDialogProps) {
	const { editorRef } = useStore();
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
			<Button
				disabled={
					!editorRef.current ||
					(!editorRef.current.history.undos.length &&
						!editorRef.current.history.redos.length)
				}
				onClick={() => {
					if (editorRef.current) editorRef.current.history.clear();
					onConfirm();
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
