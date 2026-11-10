import { Box, Button, Chip } from '@mui/material';

import {
	ConcreteDialogProps,
	CustomDialog
} from '../../../ThreeEditor/components/Dialog/CustomDialog';

export type InputFilesLoss = 'overwrite' | 'discard';

export function OverwriteInputFilesDialog({
	onClose,
	kind,
	action,
	fileNames,
	onCancel,
	onOverwrite
}: ConcreteDialogProps<{
	kind: InputFilesLoss;
	action: string;
	fileNames: string[];
	onCancel: () => void;
	onOverwrite: (downloadCurrent: boolean) => void;
}>) {
	const cancel = () => {
		onCancel();
		onClose();
	};

	const overwrite = (downloadCurrent: boolean) => {
		onOverwrite(downloadCurrent);
		onClose();
	};

	return (
		<CustomDialog
			onClose={cancel}
			alert={true}
			title={kind === 'overwrite' ? 'Overwrite input files' : 'Discard file content'}
			contentText={`${action} will ${kind === 'overwrite' ? 'replace' : 'discard the content of'} ${
				fileNames.length === 1 ? 'this file' : `these ${fileNames.length} files`
			}. The current content will be lost. Do you want to proceed?`}
			body={
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 2 }}>
					{fileNames.map(name => (
						<Chip
							key={name}
							size='small'
							variant='outlined'
							label={name}
						/>
					))}
				</Box>
			}>
			<Button
				onClick={cancel}
				color='secondary'
				autoFocus>
				Cancel
			</Button>
			<Button
				color='secondary'
				onClick={() => overwrite(true)}>
				Download current and {kind === 'overwrite' ? 'overwrite' : 'discard'}
			</Button>
			<Button
				variant='contained'
				color='secondary'
				onClick={() => overwrite(false)}>
				{kind === 'overwrite' ? 'Overwrite' : 'Discard'}
			</Button>
		</CustomDialog>
	);
}
