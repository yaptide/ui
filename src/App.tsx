import { createTheme } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SnackbarProvider } from 'notistack';
import { cloneElement, JSX, ReactElement, useMemo } from 'react';
import * as THREE from 'three';

import { ConfigProvider } from './config/ConfigService';
import { PythonConverterService } from './PythonConverter/PythonConverterService';
import { Auth } from './services/AuthService';
import { DialogProvider } from './services/DialogService';
import { KeycloakAuth } from './services/KeycloakAuthService';
import { Loader } from './services/LoaderService';
import { RemoteWorkerSimulationContextProvider } from './services/RemoteWorkerSimulationContextProvider';
import { Store } from './services/StoreService';
import { YaptideEditor } from './ThreeEditor/js/YaptideEditor';
import WrapperApp from './WrapperApp/WrapperApp';

declare module '@mui/material/styles' {
	// add new variables to the theme type
	interface TypeBackground {
		secondary: string;
	}

	interface Palette {
		accordion: Palette['primary'];
	}

	interface PaletteOptions {
		accordion?: PaletteOptions['primary'];
	}

	interface ThemeOptions {
		dimensions: {
			navDrawerWidth: number;
		};
	}
	interface Theme extends ThemeOptions {}
}

declare global {
	interface Window {
		editor: YaptideEditor;
		THREE: typeof THREE;
	}
}

/**
 * Renders a tree of React elements by reducing the `services` array from right to left and cloning each element with the accumulated children.
 * @param services An array of React elements to be rendered as a tree.
 * @param children The root element of the tree.
 * @returns The root element with all the services rendered as children.
 */
function ServiceTree({ services, children }: { services: ReactElement[]; children: JSX.Element }) {
	return services.reduceRight((acc, service) => {
		return cloneElement(service, {}, acc);
	}, children);
}

function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const theme = useMemo(
		() =>
			createTheme({
				shape: {
					borderRadius: 8
				},
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light',
					background: {
						default: prefersDarkMode ? '#101010' : '#ddd'
					},
					primary: {
						main: '#248c5e'
					},
					secondary: {
						main: prefersDarkMode ? '#b098da' : '#8261c3'
					},
					accordion: {
						main: prefersDarkMode ? '#343434' : '#e9e9e9'
					}
				},
				typography: {
					fontSize: 11
				},
				dimensions: {
					navDrawerWidth: 200
				},
				cssVariables: true
			}),
		[prefersDarkMode]
	);
	window.THREE ??= THREE;

	return (
		<ServiceTree
			services={[
				<ConfigProvider />,
				<StyledEngineProvider injectFirst />,
				<ThemeProvider theme={theme} />,
				<SnackbarProvider maxSnack={3} />,
				<DialogProvider />,
				<KeycloakAuth />,
				<Store />,
				<Auth />,
				<RemoteWorkerSimulationContextProvider />,
				<PythonConverterService />,
				<Loader />
			]}>
			<WrapperApp />
		</ServiceTree>
	);
}

export default App;
