import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider } from 'keycloak-react-web';

import { GenericContextProviderProps } from './GenericContext';

const authInstance = new Keycloak({
	url: process.env.KEYCLOAK_AUTH_URL ?? 'https://sso.pre.plgrid.pl/auth/',
	realm: process.env.KEYCLOAK_REALM ?? 'PLGrid',
	clientId: process.env.KEYCLOAK_CLIENT ?? 'yaptide-staging'
}) as any;

const initOptions = {
	pkceMethod: 'S256',
	onLoad: 'check-sso',
	checkLoginIframe: false,
	enableLogging: true
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
