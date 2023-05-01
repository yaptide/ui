import { Button } from '@mui/material';
import { CustomDialog } from './CustomDialog';

export type ClearHistoryProps = {
	open: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export function ClearHistoryDialog(props: ClearHistoryProps) {
	return (
		<CustomDialog
			open={props.open}
			onClose={props.onCancel}
			title='Clear History'
			contentText='The Undo/Redo history will be lost. Are you sure you want to continue?'>
			<Button
				onClick={props.onCancel}
				autoFocus>
				Cancel
			</Button>
			<Button onClick={props.onConfirm}>Clear and Proceed</Button>
		</CustomDialog>
	);
}
