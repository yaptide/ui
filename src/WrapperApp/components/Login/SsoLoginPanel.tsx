import { Button, Link, useTheme } from '@mui/material';
import { useCallback } from 'react';

import { useKeycloakAuth } from '../../../services/KeycloakAuthService';

interface SsoLoginPanelProps {
	onUseLocalLogin?: () => void;
}

export default function SsoLoginPanel({ onUseLocalLogin }: SsoLoginPanelProps) {
	const theme = useTheme();
	const { keycloak, initialized } = useKeycloakAuth();

	const keycloakLogin = useCallback(() => {
		if (initialized && !keycloak.authenticated) keycloak.login();
	}, [initialized, keycloak]);

	return (
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
			{onUseLocalLogin && (
				<Link
					color='textDisabled'
					onClick={onUseLocalLogin}
					sx={{ cursor: 'pointer' }}>
					Log in with username and password
				</Link>
			)}
		</>
	);
}
