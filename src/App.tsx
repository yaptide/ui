import { createTheme } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { PythonConverterService } from './PythonConverter/PythonConverterService';
import { Auth } from './services/AuthService';
import { ShSimulation } from './services/ShSimulatorService';
import { Store } from './services/StoreService';
import WrapperApp from './WrapperApp/WrapperApp';
import { keycloak } from './keycloak';

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
		<ReactKeycloakProvider authClient={keycloak}>
			<StyledEngineProvider injectFirst>
				<SnackbarProvider maxSnack={3}>
					<ThemeProvider theme={theme}>
						<Auth>
							<ShSimulation>
								<PythonConverterService>
									<Store>
										<WrapperApp />
									</Store>
								</PythonConverterService>
							</ShSimulation>
						</Auth>
					</ThemeProvider>
				</SnackbarProvider>
			</StyledEngineProvider>
		</ReactKeycloakProvider>
	);
}

export default App;
