import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { ReactNode, useCallback } from 'react';

import { useConfig } from '../config/ConfigService';
import { createSubstituteContext, GenericContextProviderProps } from './GenericContext';

interface KeycloakAuthProviderProps {
	client: Keycloak;
	initOptions?: KeycloakInitOptions;
	children: any;
}

declare const KeycloakProvider: React.FC<KeycloakAuthProviderProps>;

const keycloakParams = {
	url: `${process.env.REACT_APP_KEYCLOAK_BASE_URL ?? 'https://localhost:8080'}/auth/`,
	realm: `${process.env.REACT_APP_KEYCLOAK_REALM ?? 'master'}`,
	clientId: `${process.env.REACT_APP_KEYCLOAK_CLIENT_ID ?? 'my-client'}`
};

const authInstance = new Keycloak(keycloakParams) as any;

const initOptions: KeycloakInitOptions = {
	pkceMethod: 'S256',
	onLoad: 'check-sso',
	checkLoginIframe: false,
	enableLogging: false,
	silentCheckSsoFallback: false,
	silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
};

export type KeycloakAuthContext =
	| {
			initialized: false;
			keycloak?: Keycloak;
	  }
	| {
			initialized: true;
			keycloak: Keycloak;
	  };

function useKeycloak(): KeycloakAuthContext {
	return { initialized: false, keycloak: undefined };
}

const [useKeycloakAuth, KeycloakAuthContextProvider] =
	createSubstituteContext<KeycloakAuthContext>(useKeycloak);

const KeycloakAuth = ({ children }: GenericContextProviderProps) => {
	const { altAuth } = useConfig();
	const proxyContextProvider = useCallback(
		(children: ReactNode) => (
			<KeycloakAuthContextProvider
				value={{
					initialized: false
				}}>
				{children}
			</KeycloakAuthContextProvider>
		),
		[]
	);

	return altAuth ? (
		<KeycloakProvider
			client={authInstance}
			initOptions={initOptions}>
			{proxyContextProvider(children)}
		</KeycloakProvider>
	) : (
		proxyContextProvider(children)
	);
};

export { KeycloakAuth, useKeycloakAuth };
