import { Button } from '@mui/material';

import { useConfig } from '../../../config/ConfigService';
import { KeycloakAuthContext } from '../../../services/KeycloakAuthService';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function RejectKeycloakRefreshUserDialog({
	onClose,
	reason,
	keycloakAuth: { keycloak, initialized }
}: ConcreteDialogProps<{
	reason: string;
	keycloakAuth: KeycloakAuthContext;
}>) {
	const { backendUrl } = useConfig();

	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title={`${backendUrl}: Authentication Failed`}
			contentText={
				`Hello ${keycloak!.tokenParsed?.preferred_username}.` +
				`We could not authenticate you because of the following:\n${reason}\n` +
				'Please contact with an administrator to resolve this issue.'
			}>
			<Button
				onClick={() => {
					onClose();

					if (initialized && keycloak!.authenticated) keycloak!.logout();
				}}
				color='secondary'
				variant='contained'
				autoFocus>
				I understand
			</Button>
		</CustomDialog>
	);
}
