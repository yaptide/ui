import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import ky, { HTTPError } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { BACKEND_URL, DEMO_MODE } from '../util/Config';
import useInterval from 'use-interval';
import { IResponse } from './ResponseTypes';

export interface AuthProps {
	children: ReactNode;
}

interface AuthUser {
	name: string;
}

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

enum StorageKey {
	USER = 'editor.user'
}

export interface IAuth {
	user: AuthUser | null;
	isAuthorized: boolean;
	login: (username: string, password: string) => void;
	logout: () => void;
	refresh: () => void;
	status: () => void;
	authKy: KyInstance;
}

interface ResAuthLogin extends IResponse {
	access_exp: number;
	refresh_exp: number;
}

interface ResAuthRefresh extends IResponse {
	access_exp: number;
}

interface ResAuthStatus extends IResponse {
	login_name: string;
}

const [useAuth, AuthContextProvider] = createGenericContext<IAuth>();

const Auth = (props: AuthProps) => {
	const [user, setUser] = useState<AuthUser | null>(load(StorageKey.USER));
	const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

	const kyRef = useRef<KyInstance>(
		ky.create({
			credentials: 'include',
			hooks: {
				afterResponse: [
					async (_request, _options, response) => {
						switch (response?.status) {
							case 401:
							case 403:
								alert('Please log in with correct username and password.');
								setUser(null);
								break;
						}
						if (response?.status > 300) {
							console.error(response.status, await response.json());
						}
					}
				]
			}
		})
	);

	useEffect(() => {
		save(StorageKey.USER, user);
	}, [user]);

	const refresh = useCallback(() => {
		if (DEMO_MODE) return;
		return kyRef.current
			.get(`${BACKEND_URL}/auth/refresh`)
			.json()
			.then((response: unknown) => {
				const { access_exp } = response as ResAuthRefresh;

				const refreshDelay = Math.max((access_exp - new Date().getTime()) / 2, 1000);

				setRefreshInterval(refreshDelay);
			})
			.catch((_: HTTPError) => {});
	}, []);

	const status = useCallback(() => {
		//not used
		if (DEMO_MODE) return;
		return kyRef.current
			.get(`${BACKEND_URL}/auth/status`)
			.json()
			.then(response => {
				const { login_name } = response as ResAuthStatus;

				setUser(() => {
					const user: AuthUser = {
						name: login_name
					};
					return user;
				});
			})
			.catch((_: HTTPError) => {});
	}, []);

	useEffect(() => {
		if (user !== null) refresh();
	}, [refresh, user]);

	useInterval(
		() => {
			refresh();
		},
		user !== null ? refreshInterval : null
	);

	const login = (username: string, password: string) => {
		kyRef.current
			.post(`${BACKEND_URL}/auth/login`, {
				json: {
					login_name: username,
					password
				}
			})
			.json()
			.then((response: unknown) => {
				setUser({ name: username });
				const { access_exp } = response as ResAuthLogin;

				const refreshDelay = Math.max((access_exp - new Date().getTime()) / 2, 1000);

				setRefreshInterval(refreshDelay);
			})
			.catch((_: HTTPError) => {});
	};

	const logout = () => {
		kyRef.current
			.delete(`${BACKEND_URL}/auth/logout`)
			.json()
			.then(() => {
				setUser(null);
			})
			.catch((_: HTTPError) => {});
	};

	const value: IAuth = {
		user,
		isAuthorized: user !== null || DEMO_MODE,
		login,
		logout,
		authKy: kyRef.current,
		status,
		refresh
	};

	return <AuthContextProvider value={value}>{props.children}</AuthContextProvider>;
};

export { useAuth, Auth };
