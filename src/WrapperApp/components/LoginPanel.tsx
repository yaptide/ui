import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useAuth } from '../../services/AuthService';

export default function LoginPanel() {
	const { login } = useAuth();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};
	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	return (
		<Box
			sx={{
				margin: '0 auto',
				display: 'flex',
				alignItems: 'center',
				padding: '5rem'
			}}>
			<Box
				component='form'
				sx={{
					margin: '0 auto',
					backgroundColor: 'rgba(255,255,255,.6)',
					display: 'flex',
					flexDirection: 'column',
					gap: '1.5rem',
					padding: '5rem'
				}}>
				<TextField
					id='loginField'
					label='Username adress'
					variant='outlined'
					value={username}
					onChange={handleUsernameChange}
				/>
				<TextField
					id='passwordField'
					label='Password'
					variant='outlined'
					type='password'
					value={password}
					onChange={handlePasswordChange}
				/>
				<Button variant='outlined' onClick={() => login(username, password)}>
					Login
				</Button>
			</Box>
		</Box>
	);
}
