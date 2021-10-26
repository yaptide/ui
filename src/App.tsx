import { Box, createTheme } from '@mui/material';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import './App.css';
import ThreeEditor from './ThreeEditor/ThreeEditor';
import WrapperApp from './WrapperApp/WrapperApp';

function App() {
  const theme = createTheme();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {(process.env.REACT_APP_TARGET === 'github' ?
          <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ThreeEditor ></ThreeEditor>
          </Box>
          :
          <WrapperApp></WrapperApp>
        )}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
