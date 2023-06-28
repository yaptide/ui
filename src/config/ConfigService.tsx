import { ReactNode, useEffect, useState } from 'react';

import { createGenericContext } from '../services/GenericContext';
import { snakeToCamelCase } from '../types/TypeTransformUtil';

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

function isKeyForConfig(key: string): key is keyof Config {
	return ['backendUrl', 'deployment', 'demoMode', 'altAuth'].includes(key);
}

const ConfigProvider = ({ children }: { children: ReactNode }) => {
	const [config, setConfig] = useState<Config>({
		backendUrl: BACKEND_URL,
		deployment: DEPLOYMENT,
		demoMode: DEMO_MODE,
		altAuth: ALT_AUTH
	});

	useEffect(() => {
		const defineProperty = (
			name: string,
			readonly = false,
			configKey = snakeToCamelCase(name)
		) => {
			try {
				if (!isKeyForConfig(configKey))
					throw new Error(`Config key ${configKey} not found`);

				if (Object.prototype.hasOwnProperty.call(window, name)) return;

				Object.defineProperty(window, name, {
					get() {
						return config[configKey];
					},
					set: readonly
						? undefined
						: value =>
								setConfig(prevConfig => ({
									...prevConfig,
									[configKey]: value
								}))
				});
			} catch (e) {
				console.error(`Failed to define global property ${name}: ${e}`);
			}
		};
		if (config.deployment === 'dev') {
			defineProperty('BACKEND_URL');
			defineProperty('DEPLOYMENT', true);
			defineProperty('DEMO_MODE');
			defineProperty('ALT_AUTH');
		}
	}, [config]);

	return <ConfigContextProvider value={config}>{children}</ConfigContextProvider>;
};

export { ConfigProvider, useConfig };
