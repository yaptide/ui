import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import ky, { HTTPError } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { BACKEND_URL, DEMO_MODE } from '../util/Config';
import useInterval from 'use-interval';
import {
	ResponseAuthLogin,
	Response,
	ResponseAuthRefresh,
	ResponseAuthStatus
} from './ResponseTypes';
import { snakeToCamelCase } from './TypeTransformUtil';
import {
	RequestAuthLogin,
	RequestAuthLogout,
	RequestAuthRefresh,
	RequestAuthStatus
} from './RequestTypes';

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

const getRefreshDelay = (exp: number) => Math.max((exp - new Date().getTime()) / 2, 1000);

enum StorageKey {
	USER = 'editor.user'
}

export interface IAuth {
	user: AuthUser | null;
	isAuthorized: boolean;
	login: (...args: RequestAuthLogin) => void;
	logout: (...args: RequestAuthLogout) => void;
	refresh: (...args: RequestAuthRefresh) => void;
	status: (...args: RequestAuthStatus) => void;
	authKy: KyInstance;
}

const [useAuth, AuthContextProvider] = createGenericContext<IAuth>();

const Auth = ({ children }: AuthProps) => {
	const [user, setUser] = useState<AuthUser | null>(load(StorageKey.USER));
	const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

	const kyRef = useRef<KyInstance>(
		ky.create({
			credentials: 'include',
			prefixUrl: BACKEND_URL,
			retry: 0,
			//overwrite default json parser to convert snake_case to camelCase
			parseJson: (text: string) => snakeToCamelCase(JSON.parse(text), true),
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
							console.error(
								response.status,
								await response.json().then(r => r.message)
							);
						}
					}
				]
			}
		})
	);

	const refresh = useCallback(() => {
		if (DEMO_MODE) return;
		return kyRef.current
			.get(`auth/refresh`)
			.json<ResponseAuthRefresh>()
			.then(({ accessExp }) => setRefreshInterval(getRefreshDelay(accessExp)))
			.catch((_: HTTPError) => {});
	}, []);

	const status = useCallback(() => {
		//not used
		if (DEMO_MODE) return;
		return kyRef.current
			.get(`auth/status`)
			.json<ResponseAuthStatus>()
			.then(({ username }) => setUser({ username }))
			.catch((_: HTTPError) => {});
	}, []);

	const login = useCallback((...[username, password]: RequestAuthLogin) => {
		kyRef.current
			.post(`auth/login`, {
				json: { username, password }
			})
			.json<ResponseAuthLogin>()
			.then(({ accessExp }) => {
				setUser({ username });
				setRefreshInterval(getRefreshDelay(accessExp));
			})
			.catch((_: HTTPError) => {});
	}, []);

	const logout = useCallback(() => {
		kyRef.current
			.delete(`auth/logout`)
			.json<Response>()
			.then(_response => setUser(null))
			.catch((_: HTTPError) => {});
	}, []);
	const authKy = useMemo(() => kyRef.current, []);
	const isAuthorized = useMemo(() => user !== null || DEMO_MODE, [user]);

	useEffect(() => {
		save(StorageKey.USER, user);
	}, [user]);

	useEffect(() => {
		if (user !== null) refresh();
	}, [refresh, user]);

	useInterval(
		() => {
			refresh();
		},
		user !== null ? refreshInterval : null
	);

	return (
		<AuthContextProvider
			value={{
				user,
				isAuthorized,
				login,
				logout,
				authKy,
				status,
				refresh
			}}>
			{children}
		</AuthContextProvider>
	);
};

export { useAuth, Auth };
