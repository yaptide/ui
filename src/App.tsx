import { createTheme } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { PythonConverterService } from './PythonConverter/PythonConverterService';
import { Auth } from './services/KeyCloakService';
import { ShSimulation } from './services/ShSimulatorService';
import { Store } from './services/StoreService';
import WrapperApp from './WrapperApp/WrapperApp';
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { keycloak } from './services/keycloak';

function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light'
				}
			}),
		[prefersDarkMode]
	);
	return (
		<StyledEngineProvider injectFirst>
			<SnackbarProvider maxSnack={3}>
				<ThemeProvider theme={theme}>
					<ReactKeycloakProvider authClient={keycloak}>
						<Auth>
							<ShSimulation>
								<PythonConverterService>
									<Store>
										<WrapperApp />
									</Store>
								</PythonConverterService>
							</ShSimulation>
						</Auth>
					</ReactKeycloakProvider>
				</ThemeProvider>
			</SnackbarProvider>
		</StyledEngineProvider>
	);
}

export default App;
