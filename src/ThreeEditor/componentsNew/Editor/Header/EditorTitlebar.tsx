import { Button, CircularProgress, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useDialog } from '../../../../services/DialogService';
import { useStore } from '../../../../services/StoreService';

export function EditorTitleBar() {
	const { open: openEditProjectDialog, isOpen } = useDialog('editProject');
	const { yaptideEditor } = useStore();
	const [saving, setSaving] = useState(false);
	const [title, setTitle] = useState<string>(yaptideEditor?.config.getKey('project/title'));
	const titleRef = useRef(title);

	const startSave = useCallback(() => {
		setSaving(true);
	}, []);

	const stopSave = useCallback(() => {
		setTimeout(() => setSaving(false), 700);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			const newTitle = yaptideEditor?.config.getKey('project/title');
			setTitle(newTitle);
			titleRef.current = newTitle;
		}
	}, [isOpen, yaptideEditor]);

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
		<Button
			sx={{ justifySelf: 'center' }}
			onClick={() => {
				if (yaptideEditor) {
					openEditProjectDialog({ yaptideEditor });
				}
			}}
			disableRipple>
			<Typography
				sx={{ color: 'white' }}
				variant='subtitle1'
				component='div'
				align='center'
				textTransform='none'>
				{title}
			</Typography>
			{saving && (
				<CircularProgress
					size={18}
					sx={{ ml: 1, color: 'white' }}
				/>
			)}
		</Button>
	);
}
