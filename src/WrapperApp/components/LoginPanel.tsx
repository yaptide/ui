import { Box, Button, TextField, Card, CardContent } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../services/KeyCloakService';

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

	const handleEnter = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Enter') login(username, password);
		},
		[login, password, username]
	);
	// Handle login on 'Enter' keystroke
	useEffect(() => {
		document.addEventListener('keydown', handleEnter);
		return () => document.removeEventListener('keydown', handleEnter);
	}, [handleEnter]);

	return (
		<Box
			sx={{
				margin: '0 auto',
				display: 'flex',
				alignItems: 'center',
				padding: '5rem'
			}}>
			<Card variant='outlined'>
				<CardContent>
					<TextField
						id='loginField'
						label='Username adress'
						variant='outlined'
						value={username}
						onChange={handleUsernameChange}
					/>
				</CardContent>
				<CardContent>
					<TextField
						id='passwordField'
						label='Password'
						variant='outlined'
						type='password'
						value={password}
						onChange={handlePasswordChange}
					/>
				</CardContent>
				<CardContent>
					<Button variant='outlined' onClick={() => login(username, password)}>
						Login
					</Button>
				</CardContent>
			</Card>
		</Box>
	);
}
