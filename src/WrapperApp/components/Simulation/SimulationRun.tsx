import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	FormControl,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	SelectChangeEvent,
	ToggleButton,
	ToggleButtonGroup,
	Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useStore } from '../../../services/StoreService';
import { Simulator } from '../../../ThreeEditor/js/Editor.SimulationEnv';

type InputSource = 'files' | 'editor';
type SimulationRunProps = {
	isInProgress: boolean;
	onClickRun: () => void;
};

export function SimulationRun({ isInProgress, onClickRun }: SimulationRunProps) {
	const { editorRef, inputFiles, setInputFiles } = useStore();
	const [inputSource, setInputSource] = useState<InputSource>(inputFiles ? 'files' : 'editor');
	const [simulator, setSimulator] = useState<Simulator | ''>('');
	const [numberOfProcesses, setNumberOfProcesses] = useState(1);
	const changeSimulator = (event: SelectChangeEvent) => {
		setSimulator(event.target.value as Simulator | '');
	};
	const changeNumberOfProcesses = (event: SelectChangeEvent) => {
		setNumberOfProcesses(Number(event.target.value));
	};
	const inputFilesName = () => {
		if (inputFiles && inputFiles['info.json']) {
			try {
				console.log(inputFiles['info.json']);
				return JSON.parse(inputFiles['info.json'])?.name;
			} catch (e) {}
		}
		return 'Choose input files from previous simulations or generate them in imput editor';
	};
	useEffect(() => {
		setInputSource(inputFiles ? 'files' : 'editor');
	}, [inputFiles]);
	const simulatorSelect = useCallback(
		(options: Partial<Record<Simulator, Simulator>>) => {
			const entries = Object.entries(options);
			if (entries.length === 1)
				return (
					<Typography variant='h6' sx={{ pt: 1 }}>
						{'Simulator: ' + entries[0][1]}
					</Typography>
				);
			return (
				<>
					<InputLabel id='simulator-select-label'>Simulator</InputLabel>
					<Select
						labelId='simulator-select-label'
						id='simulator-select'
						value={simulator}
						label='Simulator'
						onChange={changeSimulator}>
						{entries.map(([key, label]) => (
							<MenuItem key={key} value={key}>
								{label}
							</MenuItem>
						))}
					</Select>
				</>
			);
		},
		[simulator]
	);

	return (
		<Card>
			<CardContent
				sx={{
					display: 'flex',
					pb: 0
				}}>
				<Typography gutterBottom variant='h5' component='div'>
					Choose input source
				</Typography>
			</CardContent>
			<CardContent
				sx={{
					display: 'flex',
					gap: 2,
					pb: 0,
					pt: 0
				}}>
				<ToggleButtonGroup
					value={inputSource}
					exclusive
					onChange={(_e, inputSource) => {
						switch (inputSource) {
							case 'files':
								setInputSource(inputSource);
								return;
							case 'editor':
								setInputFiles(undefined);
								setInputSource(inputSource);
								return;
							default:
								return;
						}
					}}>
					<ToggleButton color='info' value='files'>
						Input Files
					</ToggleButton>
					<ToggleButton color='warning' value='editor'>
						Editor Project
					</ToggleButton>
				</ToggleButtonGroup>
				{inputSource === 'editor' ? (
					<Box>
						<FormControl sx={{ minWidth: 100 }}>
							{simulatorSelect(
								editorRef.current?.simEnvManager.getPossibleSimulators() || {}
							)}
						</FormControl>
					</Box>
				) : (
					<Box>
						<Typography
							gutterBottom
							variant={inputFiles ? 'h5' : 'h6'}
							component='div'
							sx={{
								pt: 1
							}}>
							{inputFilesName()}
						</Typography>
					</Box>
				)}
			</CardContent>
			<CardContent
				sx={{
					display: 'flex',
					pb: 0
				}}>
				<Box>
					<FormControl sx={{ minWidth: 218 }}>
						<InputLabel id='number-of-processes-label'>Number of processes</InputLabel>
						<Select
							labelId='number-of-processes-label'
							id='number-of-processes'
							value={String(numberOfProcesses)}
							label='Number of processes'
							onChange={changeNumberOfProcesses}>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
								<MenuItem key={value} value={value}>
									{value}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			</CardContent>
			<CardContent>
				<LinearProgress
					color='info'
					variant={isInProgress ? 'indeterminate' : 'determinate'}
					value={0}
				/>
			</CardContent>
			<CardActions>
				<Button
					color='info'
					sx={{
						width: 'min(300px, 100%)',
						margin: '0 auto'
					}}
					onClick={onClickRun}>
					{isInProgress ? 'Stop' : 'Start'}
				</Button>
			</CardActions>
		</Card>
	);
}
