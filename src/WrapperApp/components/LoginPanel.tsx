import { Box, Button, TextField, Card, CardContent } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../services/AuthService';
// import { useOidc, useOidcUser } from "@axa-fr/react-oidc";
// import { useKeycloak } from '@react-keycloak/web'

export default function LoginPanel() {
	const { login } = useAuth();
	// const { login, logout, isAuthenticated } = useOidc();
	// const { oidcUser } = useOidcUser();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	// const { keycloak, initialized } = useKeycloak();

	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};
	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	// const handleEnter = useCallback(
	// 	(e: KeyboardEvent) => {
	// 		if (e.key === 'Enter') login(username, password);
	// 	},
	// 	[login, password, username]
	// );
	// // Handle login on 'Enter' keystroke
	// useEffect(() => {
	// 	document.addEventListener('keydown', handleEnter);
	// 	return () => document.removeEventListener('keydown', handleEnter);
	// }, [handleEnter]);

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
					<Button variant='outlined' onClick={() => {
						console.log("login(username, password)");
					}}>
						Login
					</Button>
				</CardContent>
				{/* {
					!isAuthenticated && <CardContent>
						<Button variant='outlined' onClick={() => {
							login();
						}}>
							Login
						</Button>
					</CardContent>
				}
				{
					isAuthenticated && <CardContent>
						<Button variant='outlined' onClick={() => {
							console.log(oidcUser);
						}}>
							Log infos
						</Button>
					</CardContent>
				}
				{
					isAuthenticated && <CardContent>
						<Button variant='outlined' onClick={() => {
							logout();
						}}>
							Logout
						</Button>
					</CardContent>
				} */}
				{/* <CardContent>
					<Button variant='outlined' onClick={() => {
						if (!keycloak.authenticated) {
							console.log("login")
							keycloak.login();
						} else {
							console.log(keycloak.tokenParsed?.preferred_username)
							keycloak.logout();
						}
					}}>
						{(
							!keycloak.authenticated ? "Login with PLGrid" : "Logout with PLGrid"
						)}
					</Button>
				</CardContent>
				<CardContent>
					<Button variant='outlined' onClick={() => {
						console.log(initialized)
						console.log(keycloak.clientId);
						console.log(keycloak.authServerUrl);
						console.log(keycloak.authenticated);
						console.log("xDDDDD");
						console.log(keycloak.tokenParsed?.preferred_username)
					}}>
						Console log keycloak data
					</Button>
				</CardContent> */}
			</Card>
		</Box>
	);
}
