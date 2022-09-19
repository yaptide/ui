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
import { saveString } from '../../../util/File';
import { Editor } from '../../js/Editor';
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
	const [title, setTitle] = useState<string>(editor?.config.getKey('project/title'));
	const fileInput = React.useRef<HTMLInputElement>(null);
	const [canUndo, setCanUndo] = React.useState((editor?.history.undos.length ?? 0) > 0);
	const [canRedo, setCanRedo] = React.useState((editor?.history.redos.length ?? 0) > 0);
	const [saving, setSaving] = React.useState(false);

	useEffect(() => {
		return () => {};
	}, [editor]);

	const updateHistoryButtons = useCallback(() => {
		setCanUndo((editor?.history.undos.length ?? 0) > 0);
		setCanRedo((editor?.history.redos.length ?? 0) > 0);
	}, [editor]);

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
	}, [editor]);

	const openFile = () => {
		if (editor && fileInput.current?.files) editor.loader.loadFiles(fileInput.current.files);
		else console.warn('EditorAppBar.tsx: openFile: editor or fileInput.current.files is null');
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
					onClick: () =>
						window.confirm('Any unsaved data will be lost. Are you sure?') &&
						editor?.clear()
				},
				{
					label: 'Open',
					icon: <FolderOpenIcon />,
					disabled: false,
					input: (
						<input
							accept='.json'
							style={{ display: 'none' }}
							ref={fileInput}
							id='open-file-button'
							onChange={openFile}
							type='file'
						/>
					),
					htmlFor: 'open-file-button',
					onClick: () => {}
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
					onClick: () => {
						let output = editor?.toJSON();
						let stringfile = '';
						try {
							stringfile = JSON.stringify(output, null, '\t').replace(
								/[\n\t]+([\d.e\-[\]]+)/g,
								'$1'
							);
						} catch (e) {
							stringfile = JSON.stringify(output);
						}

						const fileName = window.prompt('Name of the file', 'editor');

						if (fileName) saveString(stringfile, `${fileName}.json`);
					}
				},
				{
					label: 'Redo (ctrl+y)',
					icon: <RedoIcon />,
					disabled: !canRedo,
					onClick: () => editor?.history.redo()
				}
			].map((option, i) => (
				<Box key={i} mr={1}>
					{option.input ? (
						<>
							{option.input}
							<label htmlFor={option.htmlFor}>
								<ToolbarButton {...option} edge={'start'} />
							</label>
						</>
					) : (
						<ToolbarButton {...option} />
					)}
				</Box>
			)),
		[editor, editor?.toJSON, canRedo, canUndo, openFile]
	);

	return (
		<AppBar position='static' color='secondary'>
			<Toolbar>
				{leftSideOptions}
				<Typography variant='subtitle1' component='div' align='center' sx={{ flexGrow: 1 }}>
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
		</AppBar>
	);
}
export default EditorAppBar;
