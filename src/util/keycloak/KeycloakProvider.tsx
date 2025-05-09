import { KeycloakInitOptions } from 'keycloak-js';
import React from 'react';

import type { KeycloakAuthProviderProps } from './interfaces';
import { IAuthContextProps, keycloakContext } from './keycloakContext';

const defaultOptions: KeycloakInitOptions = {
	onLoad: 'check-sso'
};

function createAuthProvider(AuthContext: React.Context<IAuthContextProps>) {
	const KeycloakAuthProvider: React.FC<KeycloakAuthProviderProps> = props => {
		const { client, children } = props;
		const [initialized, setInitialized] = React.useState<boolean>(false);

		React.useEffect(() => {
			const { client, initOptions } = props;
			const initialize = () => {
				client
					.init({ ...defaultOptions, ...initOptions })
					.then(() => {
						setInitialized(true);
					})
					.catch(err => {
						console.log('KeycloakAuthProvider:', err);
					});
			};
			initialize();
		}, []);

		return (
			<AuthContext.Provider value={{ initialized, client }}>{children}</AuthContext.Provider>
		);
	};

	return KeycloakAuthProvider;
}

const KeycloakProvider = createAuthProvider(keycloakContext);

export const KeycloakConsumer = keycloakContext.Consumer;
export default KeycloakProvider;
