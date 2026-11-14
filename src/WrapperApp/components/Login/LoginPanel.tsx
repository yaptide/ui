import ArrowBack from '@mui/icons-material/ArrowBack';
import { Box, CircularProgress, IconButton, Typography, useTheme } from '@mui/material';
import { useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import LocalLoginPanel from './LocalLoginPanel';
import { chooseLoginScreen, LoginMethod } from './LoginScreen';
import SsoLoginPanel from './SsoLoginPanel';

export default function LoginPanel() {
	const theme = useTheme();
	const { ssoEnabled } = useConfig();
	const { localLoginStatus } = useAuth();
	const [userChoice, setUserChoice] = useState<LoginMethod>(ssoEnabled ? 'sso' : 'local');
	const loginScreen = chooseLoginScreen(
		{
			sso: ssoEnabled,
			local: localLoginStatus
		},
		userChoice
	);

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
				{loginScreen === 'sso' && (
					<SsoLoginPanel
						onUseLocalLogin={
							localLoginStatus === 'enabled'
								? () => setUserChoice('local')
								: undefined
						}
					/>
				)}
				{loginScreen === 'local' && (
					<>
						{ssoEnabled && (
							<Box sx={{ width: '100%' }}>
								<IconButton
									size='small'
									onClick={() => setUserChoice('sso')}>
									<ArrowBack />
								</IconButton>
							</Box>
						)}
						<LocalLoginPanel />
					</>
				)}
				{loginScreen === 'waitingForServer' && <CircularProgress />}
				{loginScreen === 'noLoginMethod' && (
					<Typography>
						No login method is available. The server does not accept local accounts, and
						this build has no SSO configured. For local development, start the backend
						with ENABLE_LOCAL_USERS=true. For SSO, configure
						REACT_APP_KEYCLOAK_BASE_URL, REACT_APP_KEYCLOAK_REALM and
						REACT_APP_KEYCLOAK_CLIENT_ID.
					</Typography>
				)}
			</Box>
		</Box>
	);
}
