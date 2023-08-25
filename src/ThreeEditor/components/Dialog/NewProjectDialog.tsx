import { Button } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function NewProjectDialog({ onClose }: ConcreteDialogProps) {
	const { yaptideEditor } = useStore();

	return (
		<CustomDialog
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
					if (yaptideEditor) yaptideEditor.clear();
					onClose();
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
