import Keycloak from 'keycloak-js';
import ky, { HTTPError } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useConfig } from '../config/ConfigService';
import { RequestAuthLogin, RequestAuthLogout, RequestAuthRefresh } from '../types/RequestTypes';
import {
	ResponseAuthLogin,
	ResponseAuthRefresh,
	ResponseAuthStatus,
	YaptideResponse
} from '../types/ResponseTypes';
import { hasFields } from '../util/customGuards';
import useIntervalAsync from '../util/hooks/useIntervalAsync';
import { snakeToCamelCase } from '../util/Notation/Notation';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { keycloakConfig } from './keycloakConfig';

type AuthUser = Pick<ResponseAuthStatus, 'username' | 'source'>;

const isAuthUser = (obj: unknown): obj is AuthUser => {
	return hasFields<string>(obj, 'username') && typeof obj.username === 'string';
};

const isYaptideResponse = (obj: unknown): obj is YaptideResponse => {
	return hasFields<string>(obj, 'message') && typeof obj.message === 'string';
};

const parseYaptideResponseMessage = (obj: unknown): string =>
	isYaptideResponse(obj) ? obj.message : [obj].toString();

const load = <T extends unknown = unknown>(
	key: string,
	guard: (obj: unknown) => obj is T = (obj): obj is T => true
): T | null => {
	const item = localStorage.getItem(key);

	try {
		const data = JSON.parse(`[${item}]`);
		const obj = Array.isArray(data) && data.length === 1 ? data[0] : null;

		if (guard(obj)) return obj;

		return null;
	} catch {
		return null;
	}
};

const save = (key: string, value: unknown) => {
	if (value === undefined) return;

	return localStorage.setItem(key, JSON.stringify(value));
};

const getRefreshDelay = (exp: number) => Math.max((exp - new Date().getTime()) / 3, 1000);

enum StorageKey {
	USER = 'editor.user'
}

export interface AuthContext {
	user: AuthUser | null;
	isAuthorized: boolean;
	isServerReachable: boolean;
	login: (...args: RequestAuthLogin) => void;
	tokenLogin: () => void;
	logout: (...args: RequestAuthLogout) => void;
	refresh: (...args: RequestAuthRefresh) => void;
	authKy: KyInstance;
}

const [useAuth, AuthContextProvider] = createGenericContext<AuthContext>();
const keycloak = new Keycloak(keycloakConfig);

const Auth = ({ children }: GenericContextProviderProps) => {
	const { backendUrl, demoMode } = useConfig();
	const [user, setUser] = useState<AuthUser | null>(load(StorageKey.USER, isAuthUser));
	const [reachInterval, setReachInterval] = useState<number>();
	const [refreshInterval, setRefreshInterval] = useState<number | undefined>(180000);
	const [keyCloakInterval, setKeyCloakInterval] = useState<number>();
	const [isServerReachable, setIsServerReachable] = useState<boolean | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		setReachInterval(isServerReachable ? 180000 : undefined);
	}, [isServerReachable]);

	const kyRef = useMemo(
		() =>
			ky.create({
				credentials: 'include',
				prefixUrl: backendUrl,
				//overwrite default json parser to convert snake_case to camelCase
				parseJson: (text: string) => {
					const json = JSON.parse(text);

					if (typeof json === 'object' && json) return snakeToCamelCase(json, true);
					console.warn('Could not parse JSON: ', text);

					return text;
				},
				hooks: {
					afterResponse: [
						async (_request, _options, response) => {
							switch (response?.status) {
								case 401:
									enqueueSnackbar('Please log in.', { variant: 'warning' });
									setUser(null);

									break;
								case 403:
									enqueueSnackbar('Please log in again.', { variant: 'warning' });
									setUser(null);

									break;
							}

							if (response?.status > 300) {
								const message = await response
									.json()
									.then(parseYaptideResponseMessage);

								if (message !== 'No token provided')
									enqueueSnackbar(
										await response.json().then(parseYaptideResponseMessage),
										{
											variant: 'error'
										}
									);
								console.error(
									response.status,
									await response.json().then(parseYaptideResponseMessage)
								);
							}
						}
					]
				}
			}),
		[backendUrl, enqueueSnackbar]
	);

	const kyIntervalRef = useMemo(
		() =>
			kyRef.extend({
				retry: 0
			}),
		[kyRef]
	);

	useEffect(() => {
		if (demoMode) enqueueSnackbar('Demo mode enabled.', { variant: 'info' });
	}, [demoMode, enqueueSnackbar]);

	const reachServer = useCallback(() => {
		if (demoMode) return Promise.resolve(setIsServerReachable(false));

		return kyIntervalRef
			.get(``)
			.json<YaptideResponse>()
			.then(r => !!r.message)
			.then(status =>
				setIsServerReachable(prev => {
					if (prev !== null && status !== prev)
						status
							? enqueueSnackbar('Server is reachable.', { variant: 'success' })
							: enqueueSnackbar('Server is unreachable.', { variant: 'error' });

					return status;
				})
			)
			.catch(() => setIsServerReachable(false));
	}, [demoMode, enqueueSnackbar, kyIntervalRef]);

	useIntervalAsync(reachServer, reachInterval);
	useEffect(() => {
		reachServer();
	}, [reachServer]);

	useEffect(() => {
		if (
			user !== null &&
			user.source !== 'keycloak' &&
			refreshInterval === undefined &&
			isServerReachable
		)
			setRefreshInterval(3000);
		else if (!isServerReachable || !user?.source) setRefreshInterval(undefined);
	}, [isServerReachable, refreshInterval, user]);

	const tokenLogin = useCallback(() => {
		const username = keycloak.tokenParsed?.preferred_username;
		kyRef
			.post(`auth/keycloak`, {
				headers: {
					Authorization: `Bearer ${keycloak.token}`
				},
				json: {
					username
				}
			})
			.then(() => {
				setUser({
					username,
					source: 'keycloak'
				});
			})
			.catch((_: HTTPError) => {});
	}, [kyRef]);

	useEffect(() => {
		keycloak
			.init({
				pkceMethod: 'S256',
				checkLoginIframe: false
			})
			.then(auth => {
				console.log('after init', auth);

				if (auth) {
					setKeyCloakInterval(
						keycloak.tokenParsed?.exp !== undefined
							? getRefreshDelay(keycloak.tokenParsed.exp * 1000)
							: undefined
					);
					tokenLogin();
				}
			});
	}, [tokenLogin]);

	const login = useCallback(
		(...[username, password]: RequestAuthLogin) => {
			kyRef
				.post(`auth/login`, {
					json: { username, password }
				})
				.json<ResponseAuthLogin>()
				.then(({ accessExp }) => {
					setUser({ username });
					setRefreshInterval(getRefreshDelay(accessExp));
					enqueueSnackbar('Logged in.', { variant: 'success' });
				})
				.catch((_: HTTPError) => {});
		},
		[enqueueSnackbar, kyRef]
	);

	const logout = useCallback(() => {
		keycloak.logout();
		kyRef
			.delete(`auth/logout`)
			.json<YaptideResponse>()
			.catch((_: HTTPError) => {})
			.finally(() => setUser(null));
	}, [kyRef]);

	const tokenRefresh = useCallback(() => {
		if (!keycloak.authenticated) {
			setKeyCloakInterval(undefined);

			return Promise.resolve();
		}

		return keycloak
			.updateToken(300)
			.then(refreshed => {
				if (refreshed)
					console.log(
						`Token refreshed ${keycloak.tokenParsed?.exp} -> ${keycloak.tokenParsed?.exp}`
					);
			})
			.catch(() => {
				console.log('Failed to refresh token');
				logout();
			});
	}, [logout]);

	useIntervalAsync(tokenRefresh, keycloak.authenticated ? keyCloakInterval : undefined);

	const refresh = useCallback(async () => {
		if (user?.source === 'keycloak') return tokenLogin();
		if (demoMode || !isServerReachable) return Promise.resolve(setRefreshInterval(undefined));

		try {
			const { accessExp } = await kyIntervalRef
				.get(`auth/refresh`)
				.json<ResponseAuthRefresh>();

			return setRefreshInterval(getRefreshDelay(accessExp));
		} catch (_) {}
	}, [demoMode, isServerReachable, kyIntervalRef, tokenLogin, user?.source]);

	const authKy = useMemo(() => kyRef, [kyRef]);
	const isAuthorized = useMemo(() => user !== null || demoMode, [demoMode, user]);

	useEffect(() => {
		save(StorageKey.USER, user);
	}, [user]);

	useIntervalAsync(refresh, isServerReachable && user !== null ? refreshInterval : undefined);

	return (
		<AuthContextProvider
			value={{
				user,
				isAuthorized,
				isServerReachable: Boolean(isServerReachable),
				login,
				tokenLogin: keycloak.login,
				logout,
				authKy,
				refresh
			}}>
			{children}
		</AuthContextProvider>
	);
};

export { Auth, useAuth };
