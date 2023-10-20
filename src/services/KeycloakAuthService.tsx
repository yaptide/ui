import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider, useKeycloak } from 'keycloak-react-web';

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
	enableLogging: false
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

	return altAuth ? (
		<KeycloakProvider
			client={authInstance}
			initOptions={initOptions}>
			<KeycloakAuthContextProvider
				value={{
					initialized: false
				}}>
				{children}
			</KeycloakAuthContextProvider>
		</KeycloakProvider>
	) : (
		<KeycloakAuthContextProvider
			value={{
				initialized: false
			}}>
			{children}
		</KeycloakAuthContextProvider>
	);
};

export { KeycloakAuth, useKeycloakAuth };
