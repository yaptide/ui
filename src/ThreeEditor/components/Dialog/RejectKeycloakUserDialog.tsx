import { Button } from '@mui/material';

import { useKeycloakAuth } from '../../../services/KeycloakAuthService';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function RejectKeycloakUserDialog({
	onClose,
	reason
}: ConcreteDialogProps & { reason: string }) {
	const { keycloak, initialized } = useKeycloakAuth();

	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='Keycloak User Rejected'
			contentText={
				initialized
					? `Hello ${keycloak.tokenParsed?.preferred_username}. We could not accept your authorisation because of the following:\n${reason}\nPlease contact with an administrator to resolve this issue.`
					: 'Connection could not be established with the authentication server. Please try again later.'
			}>
			<Button
				onClick={() => {
					onClose();

					if (initialized && keycloak.authenticated) keycloak.logout();
				}}
				autoFocus>
				I understand
			</Button>
		</CustomDialog>
	);
}
