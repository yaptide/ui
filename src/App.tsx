import { createTheme } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SnackbarProvider } from 'notistack';
import * as React from 'react';
import { PythonConverterService } from './PythonConverter/PythonConverterService';
import { Auth } from './services/AuthService';
import { Loader } from './services/DataLoaderService';
import { ShSimulation } from './services/ShSimulatorService';
import { Store } from './services/StoreService';
import WrapperApp from './WrapperApp/WrapperApp';

function App() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light',
					primary: {
						main: '#dfc19b'
					},
					secondary: {
						main: '#37505C'
					}
				},
				typography: {
					fontSize: 11
				}
			}),
		[prefersDarkMode]
	);
	return (
		<StyledEngineProvider injectFirst>
			<SnackbarProvider maxSnack={3}>
				<ThemeProvider theme={theme}>
					<Auth>
						<ShSimulation>
							<PythonConverterService>
								<Loader>
									<Store>
										<WrapperApp />
									</Store>
								</Loader>
							</PythonConverterService>
						</ShSimulation>
					</Auth>
				</ThemeProvider>
			</SnackbarProvider>
		</StyledEngineProvider>
	);
}

export default App;
