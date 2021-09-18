import { useEffect, useRef, useState } from 'react';
import { initEditor } from './main';
import SampleComponent from './components/SampleComponent';
import './css/main.css';
import { Editor } from './js/Editor';
import ZoneManagerPanel from '../components/ZoneManagerPanel/ZoneManagerPanel';
import { CSGManager } from './util/CSG/CSGManager';


function ThreeEditor() {
  const containerEl = useRef(null);


  const [editor, setEditor] = useState<Editor>();

  useEffect(() => {
    if (containerEl.current) {
      const { editor, viewport, toolbar, sidebar, menubar, resizer } = initEditor(containerEl.current); // eslint-disable-line
      setEditor(editor);

    }
    return () => {

    }
  }, [containerEl]);


  return (
    <div className="ThreeEditor" ref={containerEl}>
      {editor &&
        <>
          <SampleComponent signal={editor.signals.objectSelected} ></SampleComponent>
        </>
      }
    </div>
  );
}

export default ThreeEditor;
