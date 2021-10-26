import { createTheme } from '@mui/material';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import './App.css';
import ThreeEditor from './ThreeEditor/ThreeEditor';

function App() {
  const theme = createTheme();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <ThreeEditor></ThreeEditor>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
