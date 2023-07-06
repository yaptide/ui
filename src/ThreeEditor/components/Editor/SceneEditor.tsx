import '../../css/main.css';

import { AppBar, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useRef, useState } from 'react';
import THREE from 'three';

import { useStore } from '../../../services/StoreService';
import useDocumentTitle from '../../../util/hooks/useDocumentTitle';
import { useKeyboardEditorControls } from '../../../util/hooks/useKeyboardEditorControls';
import { YaptideEditor } from '../../js/YaptideEditor';
import { initEditor } from '../../main';
import { EditorSidebar } from '../Sidebar/EditorSidebar';
import EditorAppBar from './EditorAppBar/EditorAppBar';
import { EditorMenu } from './EditorMenu/EditorMenu';

declare global {
	interface Window {
		editor: YaptideEditor;
		THREE: typeof THREE;
	}
}
interface SceneEditorProps {
	focus: boolean;
	sidebarProps: boolean[];
}

function SceneEditor(props: SceneEditorProps) {
	const wrapperElementRef = useRef<HTMLDivElement>(null);
	const { editorRef, initializeEditor } = useStore();
	const containerEl = useRef<HTMLDivElement>(null);

	useKeyboardEditorControls(editorRef.current, wrapperElementRef);

	useEffect(() => {
		if (containerEl.current) {
			initializeEditor(containerEl.current);
		}
	}, [containerEl, initializeEditor]);

	useEffect(() => {
		if (props.focus) {
			containerEl.current?.focus();
			editorRef.current?.signals.sceneGraphChanged.dispatch();
		} else containerEl.current?.blur();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.focus]);

	useEffect(
		() => {
			editorRef.current?.signals.windowResize.dispatch();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[props.sidebarProps]
	);

	return (
		<Box
			ref={wrapperElementRef}
			tabIndex={-1}
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
				<EditorAppBar editor={editorRef.current} />
				<EditorMenu editor={editorRef.current} />
				<div
					className='ThreeEditor'
					ref={containerEl}
					style={{
						position: 'relative',
						display: 'flex',
						flexGrow: 1
					}}>
					{!editorRef.current && (
						<CircularProgress
							sx={{
								margin: 'auto'
							}}
						/>
					)}
				</div>
			</Box>
			{editorRef.current && props.focus && (
				<AppBar
					className='ThreeEditorSidebar'
					position='static'
					color='secondary'
					sx={{
						'width': 370,
						'&.MuiAppBar-colorSecondary': {
							backgroundColor: ({ palette }) => palette.background.secondary
						}
					}}>
					<EditorSidebar editor={editorRef.current}></EditorSidebar>
				</AppBar>
			)}
		</Box>
	);
}

export default SceneEditor;
