import { Button } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function ClearHistoryDialog({ onClose }: ConcreteDialogProps) {
	const { editorRef } = useStore();

	return (
		<CustomDialog
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
					onClose();
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
