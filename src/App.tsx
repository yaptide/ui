import { createTheme } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { OidcProvider } from '@axa-fr/react-oidc';
// import { ReactKeycloakProvider } from "@react-keycloak/web";
import { PythonConverterService } from './PythonConverter/PythonConverterService';
import { Auth } from './services/AuthService';
import { ShSimulation } from './services/ShSimulatorService';
import { Store } from './services/StoreService';
import WrapperApp from './WrapperApp/WrapperApp';
import { auth_config } from './keycloak';

function App() {
	console.log(window.location.origin)
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
		// <ReactKeycloakProvider authClient={keycloak} onEvent={eventLogger} onTokens={tokenLogger}>
		<OidcProvider configuration={auth_config}>
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
		</OidcProvider>
		// </ReactKeycloakProvider>
	);
}

export default App;
