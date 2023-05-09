import { AppBar, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import THREE from 'three';
import useDocumentTitle from '../../../util/hooks/useDocumentTitle';
import '../../css/main.css';
import { Editor } from '../../js/Editor';
import { initEditor } from '../../main';
import { useKeyboardEditorControls } from '../../util/hooks/useKeyboardEditorControls';
import { EditorSidebar } from '../Sidebar/EditorSidebar';
import EditorAppBar from './EditorAppBar/EditorAppBar';
import { EditorMenu } from './EditorMenu/EditorMenu';
declare global {
	interface Window {
		editor: Editor;
		THREE: typeof THREE;
	}
}
interface SceneEditorProps {
	onEditorInitialized?: (editor: Editor) => void;
	focus: boolean;
	sidebarProps: boolean[];
}

function SceneEditor(props: SceneEditorProps) {
	const threeEditorRef = useRef<HTMLDivElement>(null);
	const [editor, setEditor] = useState<Editor>();
	const [title, setTitle] = useState<string>(editor?.config.getKey('project/title'));
	const containerEl = useRef<HTMLDivElement>(null);
	const theme = useTheme();

	useKeyboardEditorControls(editor, threeEditorRef);

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
			ref={threeEditorRef}
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
			{editor && props.focus && (
				<AppBar
					className='ThreeEditorSidebar'
					position='static'
					color='secondary'
					sx={{
						'width': 370,
						'&.MuiAppBar-colorSecondary': {
							backgroundColor: theme.palette.background.secondary
						}
					}}>
					<EditorSidebar editor={editor}></EditorSidebar>
				</AppBar>
			)}
		</Box>
	);
}

export default SceneEditor;
