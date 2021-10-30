import React, { useEffect, useRef, useState } from 'react';
import THREE from 'three';
import './css/main.css';
import { Editor } from './js/Editor';
import { initEditor } from './main';

declare global {
  interface Window {
    editor: Editor;
    THREE: typeof THREE;
  }
}

function ThreeEditor() {
  const containerEl = useRef(null);


  const [, setEditor] = useState<Editor>();

  useEffect(() => {
    if (containerEl.current) {

      const { editor } = initEditor(containerEl.current);
      setEditor(editor);

    }
    return () => {

    }
  }, [containerEl]);


  return (
    <div className="ThreeEditor" ref={containerEl} style={{
      position: 'relative',
      display: 'flex',
      flexGrow: 1
    }} />
  );
}

export default ThreeEditor;
