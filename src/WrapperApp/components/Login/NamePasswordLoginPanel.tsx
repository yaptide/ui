import { Box, Button, Card, CardContent, TextField, Typography, useTheme } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../services/AuthService';

export default function NamePasswordLoginPanel() {
	const { login } = useAuth();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};

	const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
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
		<>
			<TextField
				color='secondary'
				id='loginField'
				label='Username address'
				variant='outlined'
				fullWidth
				value={username}
				onChange={handleUsernameChange}
			/>
			<TextField
				color='secondary'
				id='passwordField'
				label='Password'
				variant='outlined'
				fullWidth
				type='password'
				value={password}
				onChange={handlePasswordChange}
			/>
			<Button
				color='primary'
				fullWidth
				variant='contained'
				onClick={() => login(username, password)}>
				Login
			</Button>
		</>
	);
}
