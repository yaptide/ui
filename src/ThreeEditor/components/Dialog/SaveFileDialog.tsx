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
import { ChangeEvent, useEffect, useState } from 'react';

import { FullSimulationData } from '../../../services/ShSimulatorService';
import { saveString } from '../../../util/File';
import { YaptideEditor } from '../../js/YaptideEditor';
import { CustomDialogTitle, WarnDialogProps } from './CustomDialog';

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

export function SaveFileDialog({
	open = true,
	onClose,
	onConfirm = onClose,
	editor
}: WarnDialogProps<{ editor: YaptideEditor }>) {
	const results: FullSimulationData = editor.getResults();

	const [keepResults, setKeepResults] = useState<boolean>(false);

	useEffect(() => {
		setKeepResults(results?.input.inputJson?.hash === editor?.toJSON().hash);
	}, [editor, results?.input.inputJson?.hash]);

	const [name, setName] = useState<string>('editor');
	const changeName = (event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};
	const changeKeepResults = (event: ChangeEvent<HTMLInputElement>) => {
		setKeepResults(event.target.checked);
	};
	return (
		<Dialog
			open={open}
			onClose={onClose}>
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
								disabled={results?.input.inputJson?.hash !== editor?.toJSON().hash}
								onChange={changeKeepResults}
							/>
						}
					/>
				</form>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => {
						onConfirm();
						editor && saveJson(keepResults ? results : editor?.toJSON(), name);
					}}>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
