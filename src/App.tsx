import { createTheme } from '@mui/material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { JsRootService } from './JsRoot/JsRootService';
import { PythonConverterService } from './PythonConverter/PythonConverterService';
import { Auth } from './services/AuthService';
import { ShSimulation } from './services/ShSimulatorService';
import { Store } from './services/StoreService';
import WrapperApp from './WrapperApp/WrapperApp';

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
				{/* <JsRootService></JsRootService> */}
			</ThemeProvider>
		</StyledEngineProvider>
	);
}

export default App;
