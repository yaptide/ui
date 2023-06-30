import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { FullSimulationData } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { saveString } from '../../../util/File';
import { CustomDialog, WarnDialogProps } from './CustomDialog';

const saveJson = (data: {}, fileName: string) => {
	let output = undefined;
	try {
		output = JSON.stringify(data, null, '\t');
		// this regex matches new lines and tabs that are followed by a number and replaces them with just the number
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
	name: defaultName = 'editor',
	results: providedResults
}: WarnDialogProps<{ name?: string; results?: FullSimulationData }>) {
	const { editorRef } = useStore();
	const results: FullSimulationData | undefined =
		providedResults ?? editorRef.current?.getResults();

	const [keepResults, setKeepResults] = useState<boolean>(false);

	const canKeepResults = useCallback(() => {
		return results?.input.inputJson?.hash === editorRef.current?.toJSON().hash;
	}, [editorRef, results?.input.inputJson?.hash]);

	useEffect(() => {
		setKeepResults(canKeepResults() || !!providedResults);
	}, [canKeepResults, providedResults]);

	const [name, setName] = useState<string>(defaultName);
	const changeName = (event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};
	const changeKeepResults = (event: ChangeEvent<HTMLInputElement>) => {
		setKeepResults(event.target.checked);
	};
	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			title='Save Project File'
			contentText={`This will generate a JSON file that can be loaded later.`}
			body={
				<form
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 15,
						paddingTop: 20
					}}>
					<TextField
						label='File name'
						value={defaultName}
						variant='outlined'
						onChange={changeName}
					/>
					{!canKeepResults() ||
						(!!providedResults && (
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
										onChange={changeKeepResults}
									/>
								}
							/>
						))}
				</form>
			}>
			<Button
				onClick={() => {
					onConfirm();
					editorRef.current &&
						saveJson(
							keepResults && results ? results : editorRef.current?.toJSON(),
							name
						);
				}}>
				Save
			</Button>
		</CustomDialog>
	);
}
