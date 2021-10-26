import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import './App.css';
import ThreeEditor from './ThreeEditor/ThreeEditor';

function App() {
  const theme = createMuiTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThreeEditor></ThreeEditor>
    </ThemeProvider>
  );
}

export default App;
