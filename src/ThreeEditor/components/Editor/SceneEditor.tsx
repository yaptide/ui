import '../../css/main.css';

import { AppBar, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { useKeyboardEditorControls } from '../../../util/hooks/useKeyboardEditorControls';
import { YaptideEditor } from '../../js/YaptideEditor';
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
	simulator: SimulatorType;
	onSimulatorChange: (newSimulator: SimulatorType) => void;
}

function SceneEditor(props: SceneEditorProps) {
	const wrapperElementRef = useRef<HTMLDivElement>(null);
	const { yaptideEditor, initializeEditor } = useStore();
	const containerEl = useRef<HTMLDivElement>(null);

	useKeyboardEditorControls(yaptideEditor, wrapperElementRef);

	useEffect(() => {
		if (containerEl.current) {
			initializeEditor(containerEl.current);
		}
	}, [containerEl, initializeEditor]);

	useEffect(() => {
		if (props.focus) {
			containerEl.current?.focus();
			yaptideEditor?.signals.sceneGraphChanged.dispatch();
		} else containerEl.current?.blur();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.focus]);

	useEffect(
		() => {
			yaptideEditor?.signals.windowResize.dispatch();
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
				<EditorAppBar editor={yaptideEditor} />
				<EditorMenu editor={yaptideEditor} />
				<div
					className='ThreeEditor'
					ref={containerEl}
					style={{
						position: 'relative',
						display: 'flex',
						flexGrow: 1
					}}>
					{!yaptideEditor && (
						<CircularProgress
							sx={{
								margin: 'auto'
							}}
						/>
					)}
				</div>
			</Box>
			{yaptideEditor && props.focus && (
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
					<EditorSidebar
						editor={yaptideEditor}
						simulator={props.simulator}
						onSimulatorChange={props.onSimulatorChange}></EditorSidebar>
				</AppBar>
			)}
		</Box>
	);
}

export default SceneEditor;
