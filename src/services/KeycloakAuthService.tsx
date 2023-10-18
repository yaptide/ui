import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider } from 'keycloak-react-web';

import { GenericContextProviderProps } from './GenericContext';

const authInstance = new Keycloak({
	url: `${
		process.env.KEYCLOAK_BASE_URL
			? process.env.KEYCLOAK_BASE_URL + '/auth/'
			: 'https://localhost:8080/auth/'
	}`,
	realm: `${process.env.KEYCLOAK_REALM ?? ''}`,
	clientId: `${process.env.KEYCLOAK_CLIENT_ID ?? ''}`
}) as any;

const initOptions = {
	pkceMethod: 'S256',
	onLoad: 'check-sso',
	checkLoginIframe: false,
	enableLogging: false
} as const satisfies KeycloakInitOptions;

export const KeycloakAuth = ({ children }: GenericContextProviderProps) => {
	return (
		<KeycloakProvider
			client={authInstance}
			initOptions={initOptions}>
			{children}
		</KeycloakProvider>
	);
};
