import CloseIcon from '@mui/icons-material/Close';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton
} from '@mui/material';
import React from 'react';

import { CustomDialog } from '../../../../ThreeEditor/components/Dialog/CustomDialog';

interface CustomModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onConfirm?: () => void;
}

const CustomModal = ({ open, setOpen, onConfirm }: CustomModalProps) => {
	const handleClose = () => setOpen(false);

	return (
		<CustomDialog
			open={open}
			onClose={handleClose}
			title='Delete Simulation'
			contentText='Are you sure to delete this simulation?'>
			<DialogTitle>
				<IconButton
					aria-label='close'
					onClick={handleClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: 'red'
					}}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
				<Button
					variant='contained'
					color='primary'
					onClick={onConfirm}>
					Yes
				</Button>
				<Button
					variant='contained'
					color='secondary'
					onClick={handleClose}>
					No
				</Button>
			</DialogActions>
		</CustomDialog>
	);
};

export default CustomModal;
