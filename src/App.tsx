import React from 'react';
import './App.css';
import ThreeEditor from './ThreeEditor/ThreeEditor';
import JsRoot from './JsRoot/JsRoot';
import ZoneManagerPanel from './components/ZoneManagerPanel/ZoneManagerPanel';



function App() {
  return (<>
    <JsRoot></JsRoot>
    <ZoneManagerPanel></ZoneManagerPanel>
  </>);
}

export default App;
