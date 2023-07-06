import { ReactNode, useEffect, useState } from 'react';

import { createGenericContext } from '../services/GenericContext';
import {
	CamelToSnakeCaseObject,
	UppercaseObjectKeys,
	ValidateKeysTuple
} from '../types/TypeTransformUtil';
import { snakeToCamelCase } from '../util/Notation/Notation';

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

declare global {
	interface Window extends UppercaseObjectKeys<Config> {}
}

function isKeyForConfig<T extends readonly PropertyKey[]>(
	key: string,
	configKeys: ValidateKeysTuple<keyof Config, T>
): key is keyof Config {
	return configKeys.includes(key);
}

const ConfigProvider = ({ children }: { children?: ReactNode }) => {
	const [config, setConfig] = useState<Config>({
		backendUrl: BACKEND_URL,
		deployment: DEPLOYMENT,
		demoMode: DEMO_MODE,
		altAuth: ALT_AUTH
	});
	window.BACKEND_URL ??= BACKEND_URL;

	useEffect(() => {
		const configKeys = Object.keys(config) as (keyof Config)[];
		const defineProperty = (
			name: keyof UppercaseObjectKeys<Config>,
			readonly = false,
			key = snakeToCamelCase(name)
		) => {
			try {
				if (!isKeyForConfig(key, configKeys))
					throw new Error(`Config key ${key} not found`);

				if (Object.prototype.hasOwnProperty.call(window, name)) return;

				Object.defineProperty(window, name, {
					get() {
						return config[key];
					},
					set: readonly
						? undefined
						: value =>
								setConfig(prevConfig => ({
									...prevConfig,
									[key]: value
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
