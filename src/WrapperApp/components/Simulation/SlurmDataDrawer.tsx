import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import React, { useEffect } from 'react';
import { useAuth } from '../../../services/AuthService';

export default function SlurmDataDrawer() {
	const { isDataReq, setDataReq, setSlurmData, slurmData } = useAuth();
	const [username, setUsername] = React.useState(slurmData.username ?? '');
	const [secret, setSecret] = React.useState(slurmData.secret ?? '');
	const [isOpen, setIsOpen] = React.useState(isDataReq);

	useEffect(() => {
		setIsOpen(isDataReq);
	}, [isDataReq]);

	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (
			event.type === 'keydown' &&
			((event as React.KeyboardEvent).key === 'Tab' ||
				(event as React.KeyboardEvent).key === 'Shift')
		) {
			return;
		}

		setIsOpen(open);
		setDataReq(open);
	};

	const list = () => (
		<Box
			sx={{
				width: 'min(960px, 100%)',
				margin: '0 auto',
				display: 'flex',
				flexDirection: 'column',
				padding: '2rem 0',
				gap: '1.5rem'
			}}
			role='presentation'>
			<TextField
				id='outlined-static'
				label='Username'
				value={username ?? ''}
				onChange={e => setUsername(e.target.value)}
				fullWidth
			/>
			<TextField
				id='outlined-multiline-static'
				label='Secret'
				multiline
				rows={4}
				value={secret ?? ''}
				onChange={e => setSecret(e.target.value)}
				fullWidth
			/>
			<Button
				variant='contained'
				onClick={() => {
					setSlurmData({
						username,
						secret
					});
				}}
				fullWidth>
				Save
			</Button>
		</Box>
	);

	return (
		<Drawer anchor={'bottom'} open={isOpen} onClose={toggleDrawer(false)}>
			{list()}
		</Drawer>
	);
}
