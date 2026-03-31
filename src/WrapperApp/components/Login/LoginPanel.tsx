import ArrowBack from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Link, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useKeycloakAuth } from '../../../services/KeycloakAuthService';
import NamePasswordLoginPanel from './NamePasswordLoginPanel';

export default function LoginPanel() {
	const theme = useTheme();
	const { altAuth, useBasicAuth } = useConfig();
	const { localUsersEnabled } = useAuth();
	const { keycloak, initialized } = useKeycloakAuth();
	const [namePasswordLoginSelected, setNamePasswordLoginSelected] = useState(!altAuth);
	// on Keycloak-only deployments the backend rejects local users, so do not offer password login
	const namePasswordLogin = namePasswordLoginSelected && (localUsersEnabled || !altAuth);

	const keycloakLogin = useCallback(() => {
		if (initialized && !keycloak.authenticated) keycloak.login();
	}, [initialized, keycloak]);

	const showPasswordLogin = useBasicAuth && localUsersEnabled;

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '80%'
			}}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: theme.spacing(4),
					borderRadius: theme.spacing(1),
					backgroundColor: theme.palette.accordion.main,
					gap: theme.spacing(1)
				}}>
				{!namePasswordLogin ? (
					<>
						<Button
							fullWidth
							disabled={!initialized}
							variant='contained'
							color='primary'
							onClick={keycloakLogin}
							sx={{
								fontSize: 16,
								textTransform: 'none',
								py: theme.spacing(1.5),
								px: theme.spacing(10)
							}}>
							Connect with PLGrid
						</Button>
						{showPasswordLogin && (
							<Link
								color='textDisabled'
								onClick={() => setNamePasswordLoginSelected(true)}
								sx={{ cursor: 'pointer' }}>
								use password login
							</Link>
						)}
					</>
				) : (
					<>
						{
							<Box sx={{ width: '100%' }}>
								<IconButton
									size='small'
									onClick={() => setNamePasswordLoginSelected(false)}>
									<ArrowBack />
								</IconButton>
							</Box>
						}
						<NamePasswordLoginPanel />
					</>
				)}
			</Box>
		</Box>
	);
}
