import ArrowBack from '@mui/icons-material/ArrowBack';
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	Link,
	Typography,
	useTheme
} from '@mui/material';
import { useCallback, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useKeycloakAuth } from '../../../services/KeycloakAuthService';
import { chooseLoginScreen, LoginMethod } from './LoginScreen';
import NamePasswordLoginPanel from './NamePasswordLoginPanel';

export default function LoginPanel() {
	const theme = useTheme();
	const { ssoAuthEnabled } = useConfig();
	const { passwordAuthAvailability } = useAuth();
	const { keycloak, initialized } = useKeycloakAuth();
	const [userChoice, setUserChoice] = useState<LoginMethod>(ssoAuthEnabled ? 'sso' : 'local');
	const loginScreen = chooseLoginScreen(
		{
			sso: ssoAuthEnabled,
			local: passwordAuthAvailability === 'unknown' ? 'checking' : passwordAuthAvailability
		},
		userChoice
	);

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
				{loginScreen === 'sso' && (
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
						{passwordAuthAvailability === 'enabled' && (
							<Link
								color='textDisabled'
								onClick={() => setUserChoice('local')}
								sx={{ cursor: 'pointer' }}>
								use password login
							</Link>
						)}
					</>
				)}
				{loginScreen === 'local' && (
					<>
						{ssoAuthEnabled && (
							<Box sx={{ width: '100%' }}>
								<IconButton
									size='small'
									onClick={() => setUserChoice('sso')}>
									<ArrowBack />
								</IconButton>
							</Box>
						)}
						<NamePasswordLoginPanel />
					</>
				)}
				{loginScreen === 'waitingForServer' && <CircularProgress />}
				{loginScreen === 'noLoginMethod' && (
					<Typography>
						No login method is available. Enable SSO or local users.
					</Typography>
				)}
			</Box>
		</Box>
	);
}
