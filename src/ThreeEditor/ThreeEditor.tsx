import React, { useEffect, useRef } from 'react';
import { initEditor } from './main';
import './css/main.css';

function ThreeEditor() {
  const containerEl = useRef(null);

  useEffect(() => {
    initEditor(containerEl.current);
    return () => {

    }
  }, []);

  return (
    <div className="ThreeEditor" ref={containerEl}>
    </div>
  );
}

export default ThreeEditor;
