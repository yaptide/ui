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
import React, { useEffect, useState } from 'react';
import { useStore } from '../../../services/StoreService';

type InputSource = 'files' | 'editor';
type SimulationRunProps = {
	isInProgress: boolean;
	onClickRun: () => void;
};

export function SimulationRun({ isInProgress, onClickRun }: SimulationRunProps) {
	const { editorRef, inputFiles, setInputFiles } = useStore();
	const [inputSource, setInputSource] = useState<InputSource>(inputFiles ? 'files' : 'editor');
	const [simulator, setSimulator] = useState('');
	const changeSimulator = (event: SelectChangeEvent) => {
		setSimulator(event.target.value as string);
	};
	useEffect(() => {
		setInputSource(inputFiles ? 'files' : 'editor');
	}, [inputFiles]);
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
							<InputLabel id='simulator-select-label'>Simulator</InputLabel>
							<Select
								labelId='simulator-select-label'
								id='simulator-select'
								value={simulator}
								label='Simulator'
								onChange={changeSimulator}>
								{Object.entries(
									editorRef.current?.simEnvManager.getPossibleSimulators() || {}
								).map(([key, value]) => (
									<MenuItem key={key} value={key}>
										{value}
									</MenuItem>
								))}
							</Select>
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
							{inputFiles && inputFiles['info.json']
								? JSON.parse(inputFiles['info.json'] ?? '')?.name
								: 'Choose input files from previous simulations or generate them in imput editor'}
						</Typography>
					</Box>
				)}
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
