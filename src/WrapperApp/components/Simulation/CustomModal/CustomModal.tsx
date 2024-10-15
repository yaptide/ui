import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import React from 'react';

interface CustomModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onConfirm?: () => void;
}

const CustomModal = ({ open, setOpen, onConfirm }: CustomModalProps) => {
	const handleClose = () => setOpen(false);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby='modal-title'
			aria-describedby='modal-description'>
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 400,
					bgcolor: 'background.paper',
					border: '2px solid #000',
					boxShadow: 24,
					p: 4
				}}>
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
				<Typography
					id='modal-title'
					variant='h6'
					component='h2'
					sx={{ textAlign: 'center' }}>
					Are you sure to delete this simulation?
				</Typography>
				<Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
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
				</Box>
			</Box>
		</Modal>
	);
};

export default CustomModal;
