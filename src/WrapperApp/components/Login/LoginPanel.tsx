import ArrowBack from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Link, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useKeycloakAuth } from '../../../services/KeycloakAuthService';
import NamePasswordLoginPanel from './NamePasswordLoginPanel';

export default function LoginPanel() {
	const theme = useTheme();
	const { plgridAuthEnabled } = useConfig();
	const { localUsersAvailability } = useAuth();
	const { keycloak, initialized } = useKeycloakAuth();
	const [isPasswordLoginSelected, setIsPasswordLoginSelected] = useState(!plgridAuthEnabled);
	// on Keycloak-only deployments the backend rejects local users, so do not offer password login
	const isPasswordLoginAvailable = !plgridAuthEnabled || localUsersAvailability === 'enabled';

	const showPasswordLoginForm = isPasswordLoginSelected && isPasswordLoginAvailable;

	const keycloakLogin = useCallback(() => {
		if (initialized && !keycloak.authenticated) keycloak.login();
	}, [initialized, keycloak]);

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
				{plgridAuthEnabled && !showPasswordLoginForm ? (
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
						{isPasswordLoginAvailable && (
							<Link
								color='textDisabled'
								onClick={() => setIsPasswordLoginSelected(true)}
								sx={{ cursor: 'pointer' }}>
								use password login
							</Link>
						)}
					</>
				) : (
					<>
						{plgridAuthEnabled && (
							<Box sx={{ width: '100%' }}>
								<IconButton
									size='small'
									onClick={() => setIsPasswordLoginSelected(false)}>
									<ArrowBack />
								</IconButton>
							</Box>
						)}
						<NamePasswordLoginPanel />
					</>
				)}
			</Box>
		</Box>
	);
}
