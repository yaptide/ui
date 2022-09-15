import { Editor } from '../../js/Editor';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Tooltip from '@mui/material/Tooltip';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import TransformIcon from '@mui/icons-material/Transform';
import { saveString } from '../../../util/File';
import { SelectSpeedDial } from './EditorToolbar/SelectSpeedDial';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { EditorToolbar } from './EditorToolbar/EditorToolbar';

type AppBarProps = {
	editor?: Editor;
};

function EditorAppBar({ editor }: AppBarProps) {
	const [title, setTitle] = useState<string>(editor?.config.getKey('project/title'));
	const fileInput = React.useRef<HTMLInputElement>(null);
	const [canUndo, setCanUndo] = React.useState((editor?.history.undos.length ?? 0) > 0);
	const [canRedo, setCanRedo] = React.useState((editor?.history.redos.length ?? 0) > 0);

	useEffect(() => {
		editor?.signals.titleChanged.add(setTitle);
		return () => {
			editor?.signals.titleChanged.remove(setTitle);
		};
	}, [editor]);

	useEffect(() => {
		editor?.signals.historyChanged.add(() => {
			setCanUndo((editor?.history.undos.length ?? 0) > 0);
			setCanRedo((editor?.history.redos.length ?? 0) > 0);
		});
	}, [editor]);
	const openFile = () => {
		if (editor && fileInput.current?.files) editor.loader.loadFiles(fileInput.current.files);
		else console.warn('EditorAppBar.tsx: openFile: editor or fileInput.current.files is null');
	};
	const ToolbarButton = ({ label, icon, onClick, disabled, edge }: any) => (
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
		[editor?.toJSON, canRedo, canUndo]
	);

	return (
		<AppBar position='static'>
			<Toolbar>
				{leftSideOptions}
				<Typography variant='subtitle1' component='div' align='center' sx={{ flexGrow: 1 }}>
					{title}
				</Typography>
				<EditorToolbar editor={editor} />
			</Toolbar>
		</AppBar>
	);
}
export default EditorAppBar;
