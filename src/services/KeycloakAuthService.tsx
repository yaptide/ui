import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import React, { ReactNode, useCallback } from 'react';

import { useConfig } from '../config/ConfigService';
import KeycloakProvider from '../util/keycloak/KeycloakProvider';
import { useKeycloak } from '../util/keycloak/useKeycloak';
import { createSubstituteContext, GenericContextProviderProps } from './GenericContext';

const keycloakBaseUrl = process.env.REACT_APP_KEYCLOAK_BASE_URL;
const authInstance = keycloakBaseUrl
	? (new Keycloak({
			url: `${keycloakBaseUrl}/auth/`,
			realm: process.env.REACT_APP_KEYCLOAK_REALM ?? '',
			clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID ?? ''
		}) as any)
	: undefined;

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
	const { ssoEnabled } = useConfig();
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

	return ssoEnabled && authInstance ? (
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
