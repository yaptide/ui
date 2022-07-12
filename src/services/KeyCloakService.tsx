import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import { BACKEND_URL, DEMO_MODE } from '../util/Config';
import ky, { HTTPError } from 'ky';
import { useKeycloak } from "@react-keycloak/web";
import { KyInstance } from 'ky/distribution/types/ky';
import useInterval from 'use-interval';
import { IResponseMsg } from './ResponseTypes';

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
    const { keycloak } = useKeycloak();

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
        //TODO: restore from AuthService
        return 0;
    }, []);

    const status = useCallback(() => {
        //TODO: restore from AuthService
        return 0;
    }, []);

    useEffect(() => {
        if (user !== null) refresh();
    }, [refresh, user]);

    useInterval(
        () => {
            refresh();
        },
        user !== null ? 10000 : null
    );

    const login = () => {
        keycloak.login();
        //TODO: communicate with Backend
        setUser({ name: "username" });
    }

    const logout = () => {
        keycloak.logout();
        //TODO: communicate with Backend
        setUser(null);
    }

    const value: IAuth = {
        user,
        isAuthorized: keycloak.authenticated || DEMO_MODE,
        login,
        logout,
        authKy: kyRef.current,
        status,
        refresh
    };

    return <AuthContextProvider value={value}>
            {props.children}
        </AuthContextProvider>
}

export { useAuth, Auth }