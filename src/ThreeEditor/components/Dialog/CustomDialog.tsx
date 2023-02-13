import CloseIcon from '@mui/icons-material/Close';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	DialogTitleProps,
	IconButton
} from '@mui/material';
import { ReactNode } from 'react';

type CustomDialogProps = {
	title: string;
	contentText: string;
	open: boolean;
	onClose: () => void;
	children: ReactNode;
};

export function CustomDialog(props: CustomDialogProps) {
	const { open, onClose, title, contentText, children } = props;
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText id='alert-dialog-description'>{contentText}</DialogContentText>
			</DialogContent>
			<DialogActions>{children}</DialogActions>
		</Dialog>
	);
}
interface CustomTitleProps extends DialogTitleProps {
	onClose: () => void;
}

export function CustomDialogTitle(props: CustomTitleProps) {
	const { children, onClose, ...other } = props;

	return (
		<DialogTitle sx={{ m: 0, p: 2 }} {...other}>
			{children}
			{onClose ? (
				<IconButton
					aria-label='close'
					onClick={onClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: theme => theme.palette.grey[500]
					}}>
					<CloseIcon />
				</IconButton>
			) : null}
		</DialogTitle>
	);
}
