import CloseIcon from '@mui/icons-material/Close';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogProps,
	DialogTitle,
	DialogTitleProps,
	IconButton
} from '@mui/material';
import { ReactNode } from 'react';

type CustomDialogProps = {
	title: string;
	titleId?: string;
	contentId?: string;
	alert?: boolean;
	contentText: string;
	body?: ReactNode;
	open?: boolean;
	sx?: DialogProps['sx'];
	onClose: () => void;
	children?: ReactNode;
};

export function titleToKebabCase(title: string) {
	return title.toLowerCase().replace(/\s/g, '-');
}

export type ConcreteDialogProps<T = {}> = Omit<
	{
		onClose: () => void;
	},
	keyof T
> &
	T;

export type ConcreteDialogComponent = (...args: [ConcreteDialogProps]) => JSX.Element;

export function CustomDialog({
	open = true,
	alert = false,
	onClose,
	title,
	titleId = `${titleToKebabCase(title)}-dialog-title`,
	contentId = `${titleToKebabCase(title)}-dialog-content`,
	contentText,
	sx,
	body,
	children
}: CustomDialogProps) {
	return (
		<Dialog
			sx={sx}
			role={`${alert ? 'alert' : ''}dialog`}
			aria-modal='true'
			aria-labelledby={titleId}
			aria-describedby={contentId}
			open={open}
			onClose={onClose}>
			<DialogTitle id={titleId}>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText id={contentId}>{contentText}</DialogContentText>
				{body}
			</DialogContent>
			<DialogActions>{children}</DialogActions>
		</Dialog>
	);
}
interface CustomTitleProps extends DialogTitleProps {
	onClose: () => void;
}

export function CustomDialogTitle({ children, onClose, ...other }: CustomTitleProps) {
	return (
		<DialogTitle
			sx={{ m: 0, p: 2 }}
			{...other}>
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
