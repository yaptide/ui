import { createTheme } from '@mui/material';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import './App.css';
import { JsRootService } from './JsRoot/JsRootService';
import { Store } from './services/StoreService';
import WrapperApp from './WrapperApp/WrapperApp';

function App() {
  const theme = createTheme();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <JsRootService>
          <Store>
            <WrapperApp/>
          </Store>
        </JsRootService>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
