import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import THREE from 'three';
import './css/main.css';
import { Editor } from './js/Editor';
import { initEditor } from './main';
import EditorAppBar from './components/EditorAppBar/EditorAppBar';

declare global {
	interface Window {
		editor: Editor;
		THREE: typeof THREE;
	}
}
interface ThreeEditorProps {
	onEditorInitialized?: (editor: Editor) => void;
	focus: boolean;
	openSidebar: boolean;
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
		if (props.focus) {
			containerEl.current?.focus();
			editor?.signals.sceneGraphChanged.dispatch();
		} else containerEl.current?.blur();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.focus]);

	useEffect(
		() => {
			editor?.signals.windowResize.dispatch();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[editor, props.openSidebar]
	);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden'
			}}>
			<EditorAppBar editor={editor} />
			<div
				className='ThreeEditor'
				ref={containerEl}
				style={{
					position: 'relative',
					display: 'flex',
					flexGrow: 1
				}}
			/>
		</Box>
	);
}

export default ThreeEditor;
