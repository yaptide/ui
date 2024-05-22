import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider, useKeycloak } from 'keycloak-react-web';
import { ReactNode, useCallback, useEffect } from 'react';

import { useConfig } from '../config/ConfigService';
import { createSubstituteContext, GenericContextProviderProps } from './GenericContext';

const keycloakParams = {
	url: `${process.env.REACT_APP_KEYCLOAK_BASE_URL ?? 'https://localhost:8080'}/auth/`,
	realm: `${process.env.REACT_APP_KEYCLOAK_REALM ?? ''}`,
	clientId: `${process.env.REACT_APP_KEYCLOAK_CLIENT_ID ?? ''}`
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

	// Periodically check session status
	useEffect(() => {
		const checkSession = () => {
			if (authInstance.authenticated) {
				authInstance
					.updateToken(305) // Attempt to refresh token if needed
					.then((refreshed: any) => {
						if (refreshed) {
							console.log('Token refreshed');
						} else {
							console.warn('Token not refreshed, still valid');
						}
					})
					.catch(() => {
						console.error('Failed to refresh token, logging out');
						authInstance.logout(); // Logout if token refresh fails
					});
			} else {
				console.warn('User is not authenticated');
			}
		};

		const interval = setInterval(checkSession, 300000); // Check every 5 minutes

		return () => clearInterval(interval);
	}, []);

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
