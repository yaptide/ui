import ArrowBack from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Link, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useKeycloakAuth } from '../../../services/KeycloakAuthService';
import NamePasswordLoginPanel from './NamePasswordLoginPanel';

export default function LoginPanel() {
	const theme = useTheme();
	const { altAuth } = useConfig();
	const { keycloak, initialized } = useKeycloakAuth();
	const [namePasswordLogin, setNamePasswordLogin] = useState(!altAuth);

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
				{altAuth && !namePasswordLogin ? (
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
						<Link
							color='textDisabled'
							onClick={() => setNamePasswordLogin(true)}
							sx={{ cursor: 'pointer' }}>
							use password login
						</Link>
					</>
				) : (
					<>
						{altAuth && (
							<Box sx={{ width: '100%' }}>
								<IconButton
									size='small'
									onClick={() => setNamePasswordLogin(false)}>
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
