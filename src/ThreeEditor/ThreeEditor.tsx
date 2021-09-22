import { useEffect, useRef, useState } from 'react';
import './css/main.css';
import { Editor } from './js/Editor';
import { initEditor } from './main';


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
    </div>
  );
}

export default ThreeEditor;
