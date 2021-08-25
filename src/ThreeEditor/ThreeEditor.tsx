import React, { useEffect, useRef, useState } from 'react';
import { initEditor } from './main';
import './css/main.css';
import SampleComponent from './components/SampleComponent';
import { Editor } from './js/Editor';

function ThreeEditor() {
  const containerEl = useRef(null);


  const [editor, setEditor] = useState<Editor>();
  useEffect(() => {
    if (containerEl.current) {
      const { editor, viewport, toolbar, sidebar, menubar, resizer } = initEditor(containerEl.current);
      setEditor(editor);
    }
    return () => {

    }
  }, [containerEl]);


  return (
    <div className="ThreeEditor" ref={containerEl}>
      {editor &&
        <SampleComponent signal={editor.signals.objectSelected} ></SampleComponent>
      }
    </div>
  );
}

export default ThreeEditor;
