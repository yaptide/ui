import { Box, Button, TextField } from '@mui/material';
import { useState } from 'react';

import { StoreContext } from '../../../services/StoreService';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function EditProjectInfoDialog({
	onClose,
	yaptideEditor
}: ConcreteDialogProps<Required<Pick<StoreContext, 'yaptideEditor'>>>) {
	const [title, setTitle] = useState<string>(yaptideEditor?.config.getKey('project/title'));
	const [description, setDescription] = useState<string>(
		yaptideEditor?.config.getKey('project/description')
	);

	return (
		<CustomDialog
			onClose={onClose}
			title='Edit Project Info'
			contentText='Change title or description for current project.'
			body={
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						maxWidth: '100%',
						gap: ({ spacing }) => spacing(2),
						paddingTop: ({ spacing }) => spacing(2),
						overflowX: 'auto'
					}}>
					<TextField
						fullWidth
						sx={{
							width: 550
						}}
						label='Project Title'
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
					<TextField
						fullWidth
						sx={{
							width: 550
						}}
						multiline
						label='Project Description'
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</Box>
			}>
			<Button
				onClick={onClose}
				autoFocus>
				Cancel
			</Button>
			<Button
				onClick={() => {
					if (yaptideEditor) {
						yaptideEditor.config.setKey('project/title', title);
						yaptideEditor.config.setKey('project/description', description);
					}

					onClose();
				}}>
				Save
			</Button>
		</CustomDialog>
	);
}
