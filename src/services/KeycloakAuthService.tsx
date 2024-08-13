import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider, useKeycloak } from 'keycloak-react-web';
import { ReactNode, useCallback } from 'react';

import { useConfig } from '../config/ConfigService';
import { createSubstituteContext, GenericContextProviderProps } from './GenericContext';

const keycloakParams = {
	url: `${import.meta.env.VITE_REACT_APP_KEYCLOAK_BASE_URL ?? 'https://localhost:8080'}/auth/`,
	realm: `${import.meta.env.VITE_REACT_APP_KEYCLOAK_REALM ?? ''}`,
	clientId: `${import.meta.env.VITE_REACT_APP_KEYCLOAK_CLIENT_ID ?? ''}`
};

const authInstance = new Keycloak(keycloakParams) as any;

const initOptions = {
	pkceMethod: 'S256',
	onLoad: 'check-sso',
	checkLoginIframe: false,
	enableLogging: false,
	silentCheckSsoFallback: false,
	silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
} as const satisfies KeycloakInitOptions;

export type KeycloakAuthContext =
	| {
			initialized: false;
			keycloak?: Keycloak;
	  }
	| {
			initialized: true;
			keycloak: Keycloak;
	  };

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
