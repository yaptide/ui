import '../../css/main.css';

import CircularProgress from '@mui/material/CircularProgress';
import { RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { useKeyboardEditorControls } from '../../../util/hooks/useKeyboardEditorControls';
import { YaptideEditor } from '../../js/YaptideEditor';

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
	const { yaptideEditor, initializeEditor } = useStore();
	const threeContainer = useRef<HTMLDivElement>(null);

	useKeyboardEditorControls(yaptideEditor, threeContainer as RefObject<HTMLElement>);

	useEffect(() => {
		if (threeContainer.current) {
			initializeEditor(threeContainer.current);
		}
	}, [threeContainer, initializeEditor]);

	useEffect(() => {
		if (props.focus) {
			threeContainer.current?.focus();
			yaptideEditor?.signals.sceneGraphChanged.dispatch();
		} else threeContainer.current?.blur();
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
		<div
			className='ThreeEditor'
			ref={threeContainer}
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
	);
}

export default SceneEditor;
