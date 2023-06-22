import { ReactNode, useEffect, useState } from 'react';

import { createGenericContext } from '../services/GenericContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:5000';
const DEMO_MODE = process.env.REACT_APP_TARGET === 'demo';
const ALT_AUTH = process.env.REACT_APP_ALT_AUTH === 'plg';
export const DEPLOYMENT = (process.env.REACT_APP_DEPLOYMENT as ConfigDeployment) ?? 'prod';
export type ConfigDeployment = 'dev' | 'prod' | undefined;

const [useConfig, ConfigContextProvider] = createGenericContext<Config>();

interface Config {
	backendUrl: string;
	deployment: ConfigDeployment;
	demoMode: boolean;
	altAuth: boolean;
}

const ConfigProvider = ({ children }: { children: ReactNode }) => {
	const [config, setConfig] = useState<Config>({
		backendUrl: BACKEND_URL,
		deployment: DEPLOYMENT,
		demoMode: DEMO_MODE,
		altAuth: ALT_AUTH
	});

	useEffect(() => {
		if (config.deployment === 'dev') {
			try {
				Object.defineProperties(window, {
					BACKEND_URL: {
						set: function (url: string) {
							setConfig(prevConfig => ({ ...prevConfig, backendUrl: url }));
						},
						get: function () {
							return config.backendUrl;
						}
					},
					DEPLOYMENT: {
						get: function () {
							return config.deployment;
						}
					},
					DEMO_MODE: {
						set: function (demoMode: boolean) {
							setConfig(prevConfig => ({ ...prevConfig, demoMode }));
						},
						get: function () {
							return config.demoMode;
						}
					},
					ALT_AUTH: {
						set: function (altAuth: boolean) {
							setConfig(prevConfig => ({ ...prevConfig, altAuth }));
						},
						get: function () {
							return config.altAuth;
						}
					}
				});
			} catch (e) {}
		}
	}, [config]);

	return <ConfigContextProvider value={config}>{children}</ConfigContextProvider>;
};

export { ConfigProvider, useConfig };
