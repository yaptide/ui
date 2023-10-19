import Keycloak, { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider, useKeycloak } from 'keycloak-react-web';

import { useConfig } from '../config/ConfigService';
import { createSubstituteContext, GenericContextProviderProps } from './GenericContext';

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
