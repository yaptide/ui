import CloseIcon from '@mui/icons-material/Close';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogProps,
	DialogTitle,
	DialogTitleProps,
	IconButton,
	Theme
} from '@mui/material';
import { JSX, ReactNode } from 'react';

import { testIds } from '../../../util/testIds';

type CustomDialogProps = {
	title: string;
	titleId?: string;
	contentId?: string;
	testId?: string;
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
	testId,
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
			slotProps={
				testId
					? ({
							paper: { 'data-testid': testIds.dialog(testId) }
						} as DialogProps['slotProps'])
					: undefined
			}
			open={open}
			onClose={onClose}>
			<DialogTitle
				id={titleId}
				data-testid={testId ? testIds.dialogTitle(testId) : undefined}>
				{title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText
					id={contentId}
					data-testid={testId ? testIds.dialogContent(testId) : undefined}>
					{contentText}
				</DialogContentText>
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
						color: ({ palette }: Theme) => palette.grey[500]
					}}>
					<CloseIcon />
				</IconButton>
			) : null}
		</DialogTitle>
	);
}
