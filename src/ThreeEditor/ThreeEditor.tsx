import React, { useEffect, useRef } from 'react';
import './css/main.css';
import { Editor } from './js/Editor';
import { initEditor } from './main';

interface ThreeEditorProps {
  onEditorInitialized?: (editor: Editor) => void
}

// React.memo(component, ()=>true) to prevent re-rendering and re-initializing editor 
const ThreeEditor = React.memo(function ThreeEditorComponent(props: ThreeEditorProps) {
  const containerEl = useRef(null);

  useEffect(() => {
    if (containerEl.current) {

      const { editor } = initEditor(containerEl.current);

      props.onEditorInitialized?.call(null, editor);

    }
    return () => {

    }
  }, [containerEl, props.onEditorInitialized]);


  return (
    <div className="ThreeEditor" ref={containerEl} style={{
      position: 'relative',
      display: 'flex',
      flexGrow: 1
    }} />
  );
}, () => true)

export default ThreeEditor;
