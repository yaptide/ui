import {
	Box,
	Button,
	CircularProgress,
	Menu,
	MenuItem,
	TextField,
	Typography
} from '@mui/material';
import { bindContextMenu, bindMenu, usePopupState } from 'material-ui-popup-state/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { useDialog } from '../../../../../services/DialogService';
import { useStore } from '../../../../../services/StoreService';

export function EditorTitleBar() {
	const [open, , isOpen] = useDialog('editProject');
	const { yaptideEditor } = useStore();
	const [saving, setSaving] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [title, setTitle] = useState<string>(yaptideEditor?.config.getKey('project/title'));
	const titleRef = useRef(title);
	useDocumentTitle(titleRef.current);

	const startSave = useCallback(() => {
		setSaving(true);
	}, []);

	const stopSave = useCallback(() => {
		setTimeout(() => setSaving(false), 700);
	}, []);

	const updateTitle = useCallback(() => {
		yaptideEditor?.config.setKey('project/title', title);
		titleRef.current = title;
		setEditMode(false);
	}, [yaptideEditor, title]);

	useEffect(() => {
		if (!isOpen) {
			const newTitle = yaptideEditor?.config.getKey('project/title');
			setTitle(newTitle);
			titleRef.current = newTitle;
		}
	}, [isOpen, yaptideEditor]);

	const popupState = usePopupState({ variant: 'popover', popupId: 'TitleMenu' });

	const contextOptions = [
		<MenuItem
			key='rename'
			onClick={() => {
				popupState.close();
				setTimeout(() => setEditMode(true), 1);
			}}>
			Rename
		</MenuItem>,
		<MenuItem
			key='edit project description'
			onClick={() => {
				popupState.close();
				open();
			}}>
			Edit Project Description
		</MenuItem>
	];

	useEffect(() => {
		const editor = yaptideEditor;
		editor?.signals.titleChanged.add(setTitle);
		editor?.signals.savingStarted.add(startSave);
		editor?.signals.savingFinished.add(stopSave);

		return () => {
			editor?.signals.titleChanged.remove(setTitle);
			editor?.signals.savingStarted.remove(startSave);
			editor?.signals.savingFinished.remove(stopSave);
		};
	}, [yaptideEditor, startSave, stopSave]);

	return (
		<Box
			sx={{
				width: '100%'
			}}
			{...bindContextMenu(popupState)}>
			{editMode ? (
				<form
					onSubmit={e => {
						e.preventDefault();
						updateTitle();
					}}>
					<TextField
						value={title}
						onChange={({ target: { value } }) => {
							setTitle(value);
						}}
						onBlur={updateTitle}
						autoFocus
						fullWidth
					/>
					<Button
						type='submit'
						sx={{ display: 'none' }}
					/>
				</form>
			) : (
				<Typography
					variant='subtitle1'
					component='div'
					align='center'
					onClick={() => setEditMode(true)}
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
			)}

			{contextOptions.length > 0 && (
				<Menu
					{...bindMenu(popupState)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
					{contextOptions}
				</Menu>
			)}
		</Box>
	);
}
