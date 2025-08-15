import { Box, Button, Card, CardContent, TextField, Typography, useTheme } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useKeycloakAuth } from '../../../services/KeycloakAuthService';

export default function LoginPanel() {
	const { altAuth } = useConfig();
	const { login } = useAuth();
	const { keycloak, initialized } = useKeycloakAuth();

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

	const keycloakLogin = useCallback(() => {
		if (initialized && !keycloak.authenticated) keycloak.login();
	}, [initialized, keycloak]);

	return (
		<Box
			sx={{
				margin: '0 auto',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '5rem',
				height: '80%'
			}}>
			<Card variant='outlined'>
				<CardContent>
					<TextField
						color='secondary'
						id='loginField'
						label='Username address'
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
						variant='contained'
						onClick={() => login(username, password)}>
						Login
					</Button>
					{altAuth && (
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
								disabled={!initialized}
								variant='contained'
								onClick={keycloakLogin}>
								Connect with PLGrid
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
