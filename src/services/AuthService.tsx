import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import ky, { HTTPError } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { BACKEND_URL, DEMO_MODE } from '../util/Config';
import useInterval from 'use-interval';

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

const [useAuth, AuthContextProvider] = createGenericContext<IAuth>();

const Auth = (props: AuthProps) => {
	const [user, setUser] = useState<AuthUser | null>(load(StorageKey.USER));
	const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

	const kyRef = useRef<KyInstance>(ky.create({ credentials: 'include' }));

	useEffect(() => {
		save(StorageKey.USER, user);
	}, [user]);

	const refresh = useCallback(() => {
		if (DEMO_MODE) return;
		kyRef.current
			.get(`${BACKEND_URL}/auth/refresh`)
			.json()
			.catch((error: HTTPError) => {
				console.error(error);
				console.log(error?.response);
				switch (error?.response?.status) {
					case 401:
						alert('Session expired');
						setUser(null);
						break;
				}
			});
	}, []);

	const status = useCallback(() => {
		if (DEMO_MODE) return;
		kyRef.current
			.get(`${BACKEND_URL}/auth/status`)
			.json()
			.then(response => {
				const { login_name } = response as { login_name: string };
				setUser(() => {
					const user: AuthUser = {
						name: login_name
					};
					return user;
				});
			})
			.catch((error: HTTPError) => {
				console.error(error);
				console.log(error?.response);
				switch (error?.response?.status) {
					case 401:
						alert('Session expired');
						setUser(null);
						break;
				}
			});
	}, []);

	useEffect(() => {
		if (user !== null) status();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

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
				const {
					message: { access_exp: accessExp }
				} = response as { message: { access_exp: number } };

				const refreshDelay = Math.max((accessExp - new Date().getTime()) / 2, 0);

				setRefreshInterval(refreshDelay);
			})
			.catch((error: HTTPError) => {
				console.error(error);
				console.log(error?.response);
				switch (error?.response?.status) {
					case 401:
						alert('Username or password is wrong');
						break;
				}
			});
	};

	const logout = () => {
		kyRef.current
			.delete(`${BACKEND_URL}/auth/logout`)
			.json()
			.then((response: unknown) => {
				setUser(null);
			})
			.catch((error: HTTPError) => {
				console.error(error);
				console.log(error?.response);
			});
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
