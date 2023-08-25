import { Button } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function ClearHistoryDialog({ onClose }: ConcreteDialogProps) {
	const { yaptideEditor } = useStore();

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
					!yaptideEditor ||
					(!yaptideEditor.history.undos.length && !yaptideEditor.history.redos.length)
				}
				onClick={() => {
					if (yaptideEditor) yaptideEditor.history.clear();
					onClose();
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
