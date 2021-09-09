import './App.css';
import ThreeEditor from './ThreeEditor/ThreeEditor';
import JsRoot from './JsRoot/JsRoot';
import ZoneManagerPanel from './components/ZoneManagerPanel/ZoneManagerPanel';
import { ThemeProvider } from '@material-ui/core/styles';
import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core';

function App() {
  const theme = createMuiTheme();
  return (<ThemeProvider theme={theme}>
    {/* <JsRoot></JsRoot> */}

    <ThreeEditor></ThreeEditor>
  </ThemeProvider>);
}

export default App;
