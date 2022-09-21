import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	FormControlLabel,
	TextField
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { SimulationStatusData } from '../../../services/ShSimulatorService';
import { Editor } from '../../js/Editor';
import { CustomDialogTitle } from './CustomDialog';

export type SaveFileProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: (data: {}, fileName: string) => void;
	editor: Editor;
};

export function SaveFileDialog(props: SaveFileProps) {
	const { open, onClose, onConfirm, editor } = props;
	const [keepResults, setKeepResults] = useState<boolean>(false);
	useEffect(() => {
		setKeepResults(editor?.results?.editor.hash === editor?.toJSON().hash);
	}, [props, props.editor]);

	const [name, setName] = useState<string>('editor');
	const changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};
	const changeKeepResults = (event: React.ChangeEvent<HTMLInputElement>) => {
		setKeepResults(event.target.checked);
	};
	return (
		<Dialog open={open} onClose={onClose}>
			<CustomDialogTitle onClose={onClose}>Save project file</CustomDialogTitle>
			<DialogContent>
				<DialogContentText id='save-dialog-description'>
					This will generate a JSON file that can be loaded later.
				</DialogContentText>
				<form
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 15,
						paddingTop: 20
					}}>
					<TextField
						id='outlined-basic-name'
						label='File name'
						value={name}
						variant='outlined'
						onChange={changeName}
					/>
					<FormControlLabel
						label='Include simulation results'
						sx={{
							'userSelect': 'none',
							'&.MuiFormControlLabel-root': {
								paddingLeft: 1
							}
						}}
						control={
							<Checkbox
								value={keepResults}
								disabled={editor?.results?.editor.hash !== editor?.toJSON().hash}
								onChange={changeKeepResults}
							/>
						}
					/>
				</form>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => {
						if (keepResults) onConfirm(editor?.results, name);
						else onConfirm(editor?.toJSON(), name);
					}}>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
