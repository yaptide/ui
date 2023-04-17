import FiberNewIcon from '@mui/icons-material/FiberNew';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RedoIcon from '@mui/icons-material/Redo';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import UndoIcon from '@mui/icons-material/Undo';
import { CircularProgress } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLoader } from '../../../services/DataLoaderService';
import { saveString } from '../../../util/File';
import { Editor } from '../../js/Editor';
import { NewProjectDialog } from '../Dialog/NewProjectDialog';
import { OpenFileDialog } from '../Dialog/OpenFileDialog';
import { SaveFileDialog } from '../Dialog/SaveFileDialog';
import { EditorToolbar } from './EditorToolbar/EditorToolbar';

type AppBarProps = {
	editor?: Editor;
};

type AppBarOptions = {
	label: string;
	icon: JSX.Element;
	onClick: () => void;
	disabled?: boolean;
	edge?: 'start' | 'end';
};

function EditorAppBar({ editor }: AppBarProps) {
	const { loadFromUrl } = useLoader();

	const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
	const [openFileDialogOpen, setOpenFileDialogOpen] = useState(false);
	const [saveFileDialogOpen, setSaveFileDialogOpen] = useState(false);
	const [title, setTitle] = useState<string>(editor?.config.getKey('project/title'));
	const [canUndo, setCanUndo] = React.useState((editor?.history.undos.length ?? 0) > 0);
	const [canRedo, setCanRedo] = React.useState((editor?.history.redos.length ?? 0) > 0);
	const [saving, setSaving] = React.useState(false);

	const updateHistoryButtons = useCallback(() => {
		setCanUndo((editor?.history.undos.length ?? 0) > 0);
		setCanRedo((editor?.history.redos.length ?? 0) > 0);
	}, [editor]);

	useEffect(() => {
		let path = '';
		if (editor) {
			path = window.location.href.split('?')[1];
			if (path) {
				loadFromUrl(path);
				window.history.replaceState({}, document.title, window.location.pathname);
			}
		}
		return () => {};
	}, [editor, loadFromUrl]);

	const startSave = useCallback(() => {
		setSaving(true);
	}, []);

	const stopSave = useCallback(() => {
		setTimeout(() => setSaving(false), 700);
	}, []);

	useEffect(() => {
		editor?.signals.historyChanged.add(updateHistoryButtons);
		editor?.signals.titleChanged.add(setTitle);
		editor?.signals.savingStarted.add(startSave);
		editor?.signals.savingFinished.add(stopSave);
		return () => {
			editor?.signals.historyChanged.remove(updateHistoryButtons);
			editor?.signals.titleChanged.remove(setTitle);
			editor?.signals.savingStarted.remove(startSave);
			editor?.signals.savingFinished.remove(stopSave);
		};
	}, [editor, updateHistoryButtons, setTitle, startSave, stopSave]);

	const openFile = (files: FileList) => {
		if (editor) editor.loader.loadFiles(files);
		else console.warn('EditorAppBar.tsx: openFile: editor or fileInput.current.files is null');
	};

	const saveJson = (data: {}, fileName: string) => {
		let output = undefined;
		try {
			output = JSON.stringify(data, null, '\t');
			output = output.replace(/[\n\t]+([\d.e\-[\]]+)/g, '$1');
			saveString(output, `${fileName}.json`);
		} catch (e) {
			console.warn('Could not regex output. Saving without regex...', e);
			output = JSON.stringify(data);
			saveString(output, `${fileName}.json`);
		}
	};
	const ToolbarButton = ({ label, icon, onClick, disabled, edge }: AppBarOptions) => (
		<Tooltip title={label}>
			<IconButton
				size='small'
				edge={edge}
				color='inherit'
				component='span'
				disabled={disabled}
				aria-label={'menu-' + label}
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
					onClick: () => setNewProjectDialogOpen(true)
				},
				{
					label: 'Open',
					icon: <FolderOpenIcon />,
					disabled: false,
					onClick: () => setOpenFileDialogOpen(true)
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
					onClick: () => setSaveFileDialogOpen(true)
				},
				{
					label: 'Redo (ctrl+y)',
					icon: <RedoIcon />,
					disabled: !canRedo,
					onClick: () => editor?.history.redo()
				}
			].map((option, i) => (
				<Box key={i} mr={1}>
					<ToolbarButton {...option} />
				</Box>
			)),
		[editor, canRedo, canUndo]
	);

	return (
		<AppBar position='static' color='secondary'>
			<Toolbar>
				{leftSideOptions}
				<Typography
					variant='subtitle1'
					component='div'
					align='center'
					sx={{ flexGrow: 1, marginRight: 6 }}>
					{title}
					{saving && (
						<CircularProgress
							size={18}
							sx={{ ml: 1, position: 'absolute', top: '33%', color: 'inherit' }}
						/>
					)}
				</Typography>
				<EditorToolbar editor={editor} />
			</Toolbar>
			<NewProjectDialog
				open={newProjectDialogOpen}
				onCancel={() => setNewProjectDialogOpen(false)}
				onConfirm={() => {
					editor?.clear();
					setNewProjectDialogOpen(false);
				}}
			/>
			<OpenFileDialog
				open={openFileDialogOpen}
				onClose={() => setOpenFileDialogOpen(false)}
				onFileSelected={openFile}
				onUrlSubmitted={loadFromUrl}
			/>
			{editor && (
				<SaveFileDialog
					open={saveFileDialogOpen}
					onClose={() => setSaveFileDialogOpen(false)}
					onConfirm={saveJson}
					editor={editor!}
				/>
			)}
		</AppBar>
	);
}
export default EditorAppBar;
