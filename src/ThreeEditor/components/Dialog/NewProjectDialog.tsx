import { Button } from '@mui/material';

import { useDialog } from '../../../services/DialogService';
import { StoreContext } from '../../../services/StoreService';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function NewProjectDialog({
	onClose,
	yaptideEditor
}: ConcreteDialogProps<Required<Pick<StoreContext, 'yaptideEditor'>>>) {
	const { open: openEditProject } = useDialog('editProject');

	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='New Project Alert'
			contentText='Your current project will be lost. Are you sure you want to continue?'>
			<Button
				onClick={onClose}
				color='secondary'
				autoFocus>
				Cancel
			</Button>
			<Button
				color='secondary'
				variant='contained'
				onClick={() => {
					if (yaptideEditor) {
						yaptideEditor.clear();
						yaptideEditor.config.setKey('project/title', 'New Project');
						yaptideEditor.config.setKey('project/description', '');
						openEditProject({ yaptideEditor });
					}

					onClose();
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
