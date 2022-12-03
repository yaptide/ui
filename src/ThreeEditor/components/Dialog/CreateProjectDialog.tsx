import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	TextField
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Editor } from '../../js/Editor';
import { SimulationEnv } from '../../js/Editor.SimulationEnv';
import { ObjectSelectPropertyField } from '../Sidebar/propeteries/fields/ObjectSelectPropertyField';
import { CustomDialogTitle } from './CustomDialog';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export type CreateProjectProps = {
	open: boolean;
	onCancel: () => void;
	onConfirm: (name: string, description: string, simulationEnv: SimulationEnv) => void;
	editor: Editor;
};

export function CreateProjectDialog(props: CreateProjectProps) {
	const { open, onCancel, onConfirm, editor } = props;

	const [name, setName] = useState<string>('New simulation');

	const changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};
	const [description, setDescription] = useState<string>('');
	const changeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDescription(event.target.value);
	};
	const [enviroment, setEnviroment] = useState<SimulationEnv>('shieldhit');
	const changeEnviroment = (event: SelectChangeEvent) => {
		setEnviroment(event.target.value as SimulationEnv);
	};
	return (
		<Dialog open={open} onClose={onCancel}>
			<CustomDialogTitle onClose={onCancel}>Save project file</CustomDialogTitle>
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
						label='Project name'
						value={name}
						variant='outlined'
						onChange={changeName}
					/>
					<TextField
						id='outlined-basic-name'
						label='Project description'
						value={description}
						variant='outlined'
						multiline={true}
						onChange={changeDescription}
					/>
					<FormControl fullWidth>
						<InputLabel id='simulation-env-select-label'>
							Simulation enviroment
						</InputLabel>
						<Select
							labelId='simulation-env-select-label'
							id='simulation-env-select'
							value={enviroment}
							label='Simulation enviroment'
							onChange={changeEnviroment}>
							{Object.entries(props.editor.simEnvManager.getPossibleValues()).map(
								([key, value]) => (
									<MenuItem key={key} value={key}>
										{value}
									</MenuItem>
								)
							)}
						</Select>
					</FormControl>
				</form>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => {
						onConfirm(name, description, enviroment);
					}}>
					create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
