import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useAuth } from '../../services/AuthService';

export default function LoginPanel() {
	const { login } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value);
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
					label='Email adress'
					variant='outlined'
					value={email}
					onChange={handleEmailChange}
				/>
				<TextField
					id='passwordField'
					label='Password'
					variant='outlined'
					type='password'
					value={password}
					onChange={handlePasswordChange}
				/>
				<Button variant='outlined' onClick={() => login(email, password)}>
					Login
				</Button>
			</Box>
		</Box>
	);
}
