import Keycloak from 'keycloak-js';
import { KeycloakProvider } from 'keycloak-react-web';

import { GenericContextProviderProps } from './GenericContext';

const authInstance = new Keycloak({
	url: process.env.KEYCLOAK_AUTH_URL ?? 'https://sso.pre.plgrid.pl/auth/',
	realm: process.env.KEYCLOAK_REALM ?? 'PLGrid',
	clientId: process.env.KEYCLOAK_CLIENT ?? 'yaptide-staging'
}) as any;

export const KeycloakAuth = ({ children }: GenericContextProviderProps) => {
	return <KeycloakProvider client={authInstance}>{children}</KeycloakProvider>;
};
