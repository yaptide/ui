import { createTheme } from '@mui/material';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import './App.css';
import WrapperApp from './WrapperApp/WrapperApp';

function App() {
  const theme = createTheme();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <WrapperApp></WrapperApp>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
