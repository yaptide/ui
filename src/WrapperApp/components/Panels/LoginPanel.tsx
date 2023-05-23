import { Box, Button, Card, CardContent, TextField, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../services/AuthService';
import { ALT_AUTH } from '../../../config/Config';

export default function LoginPanel() {
	const { login } = useAuth();
	const theme = useTheme();

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
				justifyContent: 'center',
				width: '100%',
				padding: '5rem'
			}}>
			<Card variant='outlined'>
				<CardContent>
					<TextField
						color='secondary'
						id='loginField'
						label='Username adress'
						variant='outlined'
						fullWidth
						value={username}
						onChange={handleUsernameChange}
					/>
				</CardContent>
				<CardContent>
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
				</CardContent>
				<CardContent
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}>
					<Button
						color='primary'
						fullWidth
						variant={theme.palette.mode === 'dark' ? 'outlined' : 'contained'}
						onClick={() => login(username, password)}>
						Login
					</Button>
					{ALT_AUTH && (
						<>
							<Typography
								color='text.secondary'
								sx={{
									padding: 1
								}}>
								or
							</Typography>
							<Button
								color='info'
								fullWidth
								variant={theme.palette.mode === 'dark' ? 'outlined' : 'contained'}
								onClick={() => login('demo', 'demo')}>
								Connect with PLGrid
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
