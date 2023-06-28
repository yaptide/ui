import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';

import { EditorJson } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { CustomDialog, WarnDialogProps } from './CustomDialog';

export function LoadFileDialog({
	open,
	onClose,
	validVersion,
	onConfirm = onClose,
	editor,
	data
}: WarnDialogProps<{
	validVersion: boolean;
	editor: YaptideEditor;
	data: EditorJson;
}>) {
	return (
		<CustomDialog
			open={open}
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
				onClick={() => {
					onConfirm();
					editor.clear();
					editor.fromJSON(data);
				}}>
				Clear and proceed
			</Button>
		</CustomDialog>
	);
}
