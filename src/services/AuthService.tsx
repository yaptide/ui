import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { createGenericContext } from './GenericContext';
import ky, { HTTPError } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { BACKEND_URL, DEMO_MODE, DEPLOYMENT } from '../config/Config';
import { snakeToCamelCase } from '../types/TypeTransformUtil';
import { RequestAuthLogin, RequestAuthLogout, RequestAuthRefresh } from '../types/RequestTypes';
import useIntervalAsync from '../util/hooks/useIntervalAsync';
import { useSnackbar } from 'notistack';
import {
	ResponseAuthStatus,
	ResponseAuthRefresh,
	ResponseAuthLogin,
	YaptideResponse
} from '../types/ResponseTypes';

declare global {
	interface Window {
		BACKEND_URL?: string;
	}
}

export interface AuthProps {
	children: ReactNode;
}

type AuthUser = Pick<ResponseAuthStatus, 'username'>;

const load = (key: string) => {
	const item = localStorage.getItem(key);
	try {
		const [obj] = JSON.parse(`[${item}]`);
		return obj;
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
	logout: (...args: RequestAuthLogout) => void;
	refresh: (...args: RequestAuthRefresh) => void;
	authKy: KyInstance;
}

const [useAuth, AuthContextProvider] = createGenericContext<AuthContext>();

const Auth = ({ children }: AuthProps) => {
	const [user, setUser] = useState<AuthUser | null>(load(StorageKey.USER));
	const [reachInterval, setReachInterval] = useState<number>(30000);
	const [refreshInterval, setRefreshInterval] = useState<number | undefined>(undefined);
	const [isServerReachable, setIsServerReachable] = useState<boolean | null>(null);
	const { enqueueSnackbar } = useSnackbar();

	const [backendUrl, setBackendUrl] = useState<string>(BACKEND_URL);

	useEffect(() => {
		setReachInterval(isServerReachable ? 180000 : 30000);
	}, [isServerReachable]);

	const kyRef = useMemo(
		() =>
			ky.create({
				credentials: 'include',
				prefixUrl: backendUrl,
				//overwrite default json parser to convert snake_case to camelCase
				parseJson: (text: string) => snakeToCamelCase(JSON.parse(text), true),
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
								const message = await response.json().then(r => r.message);
								if (message !== 'No token provided')
									enqueueSnackbar(await response.json().then(r => r.message), {
										variant: 'error'
									});
								console.error(
									response.status,
									await response.json().then(r => r.message)
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

	const setBackendUrlCallback = useCallback(
		(url: string) => {
			setBackendUrl(url);
		},
		[setBackendUrl]
	);

	// Enable backend url change in dev mode
	if (DEPLOYMENT === 'dev') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			Object.defineProperty(window, 'BACKEND_URL', {
				set: function (url: string) {
					setBackendUrlCallback(url);
				},
				get: function () {
					return backendUrl;
				},
				configurable: true
			});
		}, [backendUrl, setBackendUrlCallback]);
	}

	useEffect(() => {
		if (DEMO_MODE) enqueueSnackbar('Demo mode enabled.', { variant: 'info' });
	}, [enqueueSnackbar]);

	const reachServer = useCallback(() => {
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
	}, [enqueueSnackbar, kyIntervalRef]);

	useIntervalAsync(reachServer, reachInterval);
	useEffect(() => {
		reachServer();
	}, [reachServer]);

	const refresh = useCallback(() => {
		if (DEMO_MODE || !isServerReachable) return Promise.resolve(setRefreshInterval(undefined));
		return kyIntervalRef
			.get(`auth/refresh`)
			.json<ResponseAuthRefresh>()
			.then(({ accessExp }) => setRefreshInterval(getRefreshDelay(accessExp)))
			.catch((_: HTTPError) => {});
	}, [isServerReachable, kyIntervalRef]);

	useEffect(() => {
		if (user !== null && refreshInterval === undefined && isServerReachable)
			setRefreshInterval(3000);
		else if (!isServerReachable || user === null) setRefreshInterval(undefined);
	}, [isServerReachable, refreshInterval, user]);

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
		kyRef
			.delete(`auth/logout`)
			.json<YaptideResponse>()
			.then(_response => setUser(null))
			.catch((_: HTTPError) => {});
	}, [kyRef]);

	const authKy = useMemo(() => kyRef, [kyRef]);
	const isAuthorized = useMemo(() => user !== null || DEMO_MODE, [user]);

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
				logout,
				authKy,
				refresh
			}}>
			{children}
		</AuthContextProvider>
	);
};

export { useAuth, Auth };
