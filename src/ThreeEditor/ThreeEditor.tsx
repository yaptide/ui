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
interface ThreeEditorProps {
  onEditorInitialized?: (editor: Editor) => void
  focus?: boolean
}

function ThreeEditor(props: ThreeEditorProps) {
  const [editor, setEditor] = useState<Editor>();
  const containerEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerEl.current) {
      const { editor } = initEditor(containerEl.current);
      setEditor(editor);
    }
  }, [containerEl]);

  useEffect(() => {
    editor && props.onEditorInitialized?.call(null, editor);
  }, [editor, props.onEditorInitialized]);

  useEffect(() => {
    props.focus === true && containerEl.current?.focus();
    props.focus === false && containerEl.current?.blur();
  }, [props.focus]);

  return (
    <div className="ThreeEditor" ref={containerEl} style={{
      position: 'relative',
      display: 'flex',
      flexGrow: 1
    }}
    />
  );
}

export default ThreeEditor;
