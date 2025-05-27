import FiberNewIcon from '@mui/icons-material/FiberNew';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RedoIcon from '@mui/icons-material/Redo';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import UndoIcon from '@mui/icons-material/Undo';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { useDialog } from '../../../../services/DialogService';
import { useLoader } from '../../../../services/LoaderService';
import { useShSimulation } from '../../../../services/ShSimulatorService';
import { useStore } from '../../../../services/StoreService';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { EditorTitleBar } from './components/EditorTitlebar';
import { EditorToolbar } from './components/EditorToolbar';

type AppBarProps = {
	editor?: YaptideEditor;
};

type AppBarOptions = {
	label: string;
	icon: JSX.Element;
	onClick: () => void;
	disabled?: boolean;
	edge?: 'start' | 'end';
};

function EditorAppBar({ editor }: AppBarProps) {
	const { loadFromJson, loadFromFiles, loadFromUrl, loadFromJsonString } = useLoader();
	const { getJobResults } = useShSimulation();
	const { open: openTheOpenFileDialog } = useDialog('openFile');
	const { open: openTheSaveFileDialog } = useDialog('saveFile');
	const { open: openTheNewProjectDialog } = useDialog('newProject');
	const [canUndo, setCanUndo] = useState((editor?.history.undos.length ?? 0) > 0);
	const [canRedo, setCanRedo] = useState((editor?.history.redos.length ?? 0) > 0);
	const { yaptideEditor } = useStore();

	const updateHistoryButtons = useCallback(() => {
		setCanUndo((editor?.history.undos.length ?? 0) > 0);
		setCanRedo((editor?.history.redos.length ?? 0) > 0);
	}, [editor]);

	useEffect(() => {
		editor?.signals.historyChanged.add(updateHistoryButtons);

		return () => {
			editor?.signals.historyChanged.remove(updateHistoryButtons);
		};
	}, [editor, updateHistoryButtons]);

	const ToolbarButton = ({ label, icon, onClick, disabled, edge }: AppBarOptions) => (
		<Tooltip title={label}>
			<IconButton
				size='small'
				edge={edge}
				color='inherit'
				component='span'
				disabled={disabled}
				aria-label={'Menu ' + label}
				onClick={onClick}>
				{icon}
			</IconButton>
		</Tooltip>
	);

	const leftSideOptions = useMemo(
		() =>
			[
				{
					label: 'New',
					icon: <FiberNewIcon />,
					disabled: false,
					onClick: () => yaptideEditor && openTheNewProjectDialog({ yaptideEditor })
				},
				{
					label: 'Open',
					icon: <FolderOpenIcon />,
					disabled: false,
					onClick: () =>
						openTheOpenFileDialog({
							loadFromFiles,
							loadFromJson,
							loadFromUrl,
							loadFromJsonString,
							dialogState: '0'
						})
				},
				{
					label: 'Undo (ctrl+z)',
					icon: <UndoIcon />,
					disabled: !canUndo,
					onClick: () => editor?.history.undo()
				},
				{
					label: 'Save as',
					icon: <SaveAsIcon />,
					disabled: false,
					onClick: () =>
						yaptideEditor && openTheSaveFileDialog({ yaptideEditor, getJobResults })
				},
				{
					label: 'Redo (ctrl+y)',
					icon: <RedoIcon />,
					disabled: !canRedo,
					onClick: () => editor?.history.redo()
				}
			].map((option, i) => (
				<Box
					key={i}
					mr={1}>
					<ToolbarButton {...option} />
				</Box>
			)),
		[
			canUndo,
			canRedo,
			yaptideEditor,
			openTheNewProjectDialog,
			openTheOpenFileDialog,
			loadFromFiles,
			loadFromJson,
			loadFromUrl,
			loadFromJsonString,
			editor?.history,
			openTheSaveFileDialog
		]
	);

	return (
		<AppBar
			position='static'
			color='secondary'>
			<Toolbar>
				{leftSideOptions}
				<EditorTitleBar />
				<EditorToolbar editor={editor} />
			</Toolbar>
		</AppBar>
	);
}

export default EditorAppBar;
