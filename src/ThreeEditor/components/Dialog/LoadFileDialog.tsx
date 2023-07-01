import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';

import { useStore } from '../../../services/StoreService';
import { EditorJson } from '../../js/EditorJson';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function LoadFileDialog({
	onClose,
	validVersion = true,
	data
}: ConcreteDialogProps<{
	validVersion?: boolean;
	data?: EditorJson;
}>) {
	const { editorRef } = useStore();

	return (
		<CustomDialog
			alert={true}
			onClose={onClose}
			title='Load File Alert'
			contentText={`Loaded data will replace current project data. Are you sure you want to continue?`}
			body={
				!validVersion && (
					<Typography
						variant='body1'
						color='error'
						component={'div'}
						id={`load-file-dialog-version-warning`}
						sx={{
							marginTop: '1rem',
							fontWeight: 'bold'
						}}>
						<div>
							Warning: This file was created with an older version of this
							application.
						</div>
						Some features may not work as expected.
					</Typography>
				)
			}>
			<Button
				onClick={onClose}
				autoFocus>
				Cancel
			</Button>
			<Button
				disabled={!data}
				onClick={() => {
					onClose();
					if (data && editorRef.current) {
						editorRef.current.clear();
						editorRef.current.fromJSON(data);
					}
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
