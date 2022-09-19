import { AppBar, Box, Button, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import THREE from 'three';
import './css/main.css';
import { Editor } from './js/Editor';
import { initEditor } from './main';
import EditorAppBar from './components/EditorAppBar/EditorAppBar';
import CircularProgress from '@mui/material/CircularProgress';
import { EditorMenu } from './components/EditorMenu/EditorMenu';
import useDocumentTitle from '../util/useDocumentTitle';
import { useTheme } from '@mui/material/styles';
declare global {
	interface Window {
		editor: Editor;
		THREE: typeof THREE;
	}
}
interface ThreeEditorProps {
	onEditorInitialized?: (editor: Editor) => void;
	focus: boolean;
	sidebarProps: boolean[];
}

function ThreeEditor(props: ThreeEditorProps) {
	const [editor, setEditor] = useState<Editor>();
	const [title, setTitle] = useState<string>(editor?.config.getKey('project/title'));
	const containerEl = useRef<HTMLDivElement>(null);
	const theme = useTheme();

	useEffect(() => {
		editor?.signals.titleChanged.add(setTitle);
		return () => {
			editor?.signals.titleChanged.remove(setTitle);
		};
	}, [editor]);

	useDocumentTitle(title);

	useEffect(() => {
		if (containerEl.current) {
			const { editor: newEditor } = initEditor(containerEl.current);
			setEditor(newEditor);
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
	}, [props.focus, editor]);

	useEffect(
		() => {
			editor?.signals.windowResize.dispatch();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[editor, props.sidebarProps]
	);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'row',
				overflow: 'hidden'
			}}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					flexGrow: 1
				}}>
				<EditorAppBar editor={editor} />
				<EditorMenu editor={editor} />
				<div
					className='ThreeEditor'
					ref={containerEl}
					style={{
						position: 'relative',
						display: 'flex',
						flexGrow: 1
					}}>
					{!editor && (
						<CircularProgress
							sx={{
								margin: 'auto'
							}}
						/>
					)}
				</div>
			</Box>

			<AppBar
				position='static'
				color='secondary'
				sx={{
					'width': 350,
					'&.MuiAppBar-colorSecondary': {
						backgroundColor:
							theme.palette.mode === 'dark'
								? theme.palette.secondary.dark
								: theme.palette.secondary.light
					}
				}}>
				<Typography
					sx={{
						padding: 2
					}}>
					Placeholder for the properties panel
					<Button
						onClick={() => {
							document.getElementById('sidebar')?.classList.toggle('hidden');
						}}>
						Toggle old UI
					</Button>
				</Typography>
			</AppBar>
		</Box>
	);
}

export default ThreeEditor;
