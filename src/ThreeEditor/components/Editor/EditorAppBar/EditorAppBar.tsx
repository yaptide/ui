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
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDialog } from '../../../../services/DialogService';
import { useLoader } from '../../../../services/LoaderService';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { NewProjectDialog } from '../../Dialog/NewProjectDialog';
import { OpenFileDialog } from '../../Dialog/OpenFileDialog';
import { SaveFileDialog } from '../../Dialog/SaveFileDialog';
import { EditorToolbar } from './EditorToolbar/EditorToolbar';

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
	const { updateDialogComponent, showDialog, hideDialog } = useDialog();
	const [title, setTitle] = useState<string>(editor?.config.getKey('project/title'));
	const [canUndo, setCanUndo] = useState((editor?.history.undos.length ?? 0) > 0);
	const [canRedo, setCanRedo] = useState((editor?.history.redos.length ?? 0) > 0);
	const [saving, setSaving] = useState(false);

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
	}, [editor, updateHistoryButtons, setTitle, startSave, stopSave]);
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
					onClick: () => showDialog('newProject')
				},
				{
					label: 'Open',
					icon: <FolderOpenIcon />,
					disabled: false,
					onClick: () => showDialog('openFile')
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
					onClick: () => showDialog('saveFile')
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
		[canUndo, canRedo, showDialog, editor?.history]
	);

	/**********************************DialogConfig*************************************/
	useEffect(() => {
		updateDialogComponent(
			'saveFile',
			editor && (
				<SaveFileDialog
					onClose={() => hideDialog('saveFile')}
					editor={editor}
				/>
			)
		);
		return () => {
			updateDialogComponent('saveFile', undefined);
		};
	}, [editor, hideDialog, updateDialogComponent]);

	useEffect(() => {
		updateDialogComponent(
			'newProject',
			editor && (
				<NewProjectDialog
					editor={editor}
					onClose={() => hideDialog('newProject')}
				/>
			)
		);
	}, [editor, hideDialog, updateDialogComponent]);

	useEffect(() => {
		updateDialogComponent(
			'openFile',
			<OpenFileDialog
				onClose={() => hideDialog('openFile')}
				loadFromFiles={loadFromFiles}
				loadFromJson={loadFromJson}
				loadFromUrl={loadFromUrl}
				loadFromJsonString={loadFromJsonString}
			/>
		);
	}, [
		hideDialog,
		loadFromFiles,
		loadFromJson,
		loadFromJsonString,
		loadFromUrl,
		updateDialogComponent
	]);
	/***********************************************************************************/

	return (
		<AppBar
			position='static'
			color='secondary'>
			<Toolbar>
				{leftSideOptions}
				<Typography
					variant='subtitle1'
					component='div'
					align='center'
					sx={{
						width: 'auto',
						flexGrow: 1,
						flexShrink: 1,
						textOverflow: 'ellipsis',
						overflow: 'hidden',
						whiteSpace: 'nowrap'
					}}>
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
