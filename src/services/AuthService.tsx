import { ReactNode, useEffect, useRef, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import ky, { HTTPError } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { BACKEND_URL } from '../util/Config';

export interface AuthProps {
	children: ReactNode;
}

interface AuthUser {
	name: string;
}

const load = (key: string) => {
	const item = localStorage.getItem(key) ?? 'null';
	const obj = JSON.parse(item.length === 0 ? 'null' : item);
	return obj;
};

const save = (key: string, value: any) => {
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
	authKy: KyInstance;
}

const [useAuth, AuthContextProvider] = createGenericContext<IAuth>();

const Auth = (props: AuthProps) => {
	const [user, setUser] = useState<AuthUser | null>(load(StorageKey.USER));

	const kyRef = useRef<KyInstance>(ky.create({ credentials: 'include' }));

	useEffect(() => {
		save(StorageKey.USER, user);
	}, [user]);

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
				console.log(response);
			})
			.catch((error: HTTPError) => {
				console.error(error);
				console.log(error.response);
				switch (error.response.status) {
					case 403:
						alert('Username or password is wrong');
						break;
				}
			})
			.finally(() => {
				console.log(document.cookie);
			});
	};

	const logout = () => {
		setUser(null);
	};

	const value: IAuth = {
		user,
		isAuthorized: user !== null,
		login,
		logout,
		authKy: kyRef.current
	};

	return <AuthContextProvider value={value}>{props.children}</AuthContextProvider>;
};

export { useAuth, Auth };
