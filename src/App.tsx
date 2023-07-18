import { createTheme } from '@mui/material';
import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SnackbarProvider } from 'notistack';
import { cloneElement, ReactElement, useMemo } from 'react';
import * as THREE from 'three';

import { ConfigProvider } from './config/ConfigService';
import { PythonConverterService } from './PythonConverter/PythonConverterService';
import { Auth } from './services/AuthService';
import { DialogProvider } from './services/DialogService';
import { Loader } from './services/LoaderService';
import { ShSimulation } from './services/ShSimulatorService';
import { Store } from './services/StoreService';
import { YaptideEditor } from './ThreeEditor/js/YaptideEditor';
import WrapperApp from './WrapperApp/WrapperApp';

declare module '@mui/material/styles' {
	// add new variables to the theme type
	interface TypeBackground {
		secondary: string;
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
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light',
					primary: {
						main: '#dfc19b'
					},
					secondary: {
						main: '#37505C'
					},
					background: {
						default: prefersDarkMode ? '#121212' : '#f5f5f5',
						secondary: prefersDarkMode ? '#121212' : '#5f737c'
					}
				},
				typography: {
					fontSize: 11
				},
				dimensions: {
					navDrawerWidth: 160
				}
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
				<Auth />,
				<ShSimulation />,
				<PythonConverterService />,
				<Store />,
				<DialogProvider />,
				<Loader />
			]}>
			<WrapperApp />
		</ServiceTree>
	);
}

export default App;
