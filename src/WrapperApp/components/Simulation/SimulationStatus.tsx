import {
	Button,
	Card,
	CardActions,
	CardContent,
	Paper,
	SxProps,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Theme,
	Typography
} from '@mui/material';
import React from 'react';
import Countdown from 'react-countdown';
import {
	InputFiles,
	SimulationStatusData,
	StatusState
} from '../../../services/ShSimulationService';
import { useStore } from '../../../services/StoreService';

interface SimulationStatusProps {
	simulation: SimulationStatusData;
	loadResults?: (taskId: string | null) => void;
	showInputFiles: (inputFiles?: InputFiles) => void;
}

export default function SimulationStatus({
	simulation,
	loadResults,
	showInputFiles
}: SimulationStatusProps) {
	const { resultsSimulationData } = useStore();

	const tableRowStyle: SxProps<Theme> = { '&:last-child td, &:last-child th': { border: 0 } };

	const row = (title: string, value: {} | undefined, guard = true) => (
		<React.Fragment key={title}>
			{guard && (
				<TableRow sx={tableRowStyle}>
					<TableCell component='th' scope='row'>
						{title}
					</TableCell>
					<TableCell align='right'>{value}</TableCell>
				</TableRow>
			)}
		</React.Fragment>
	);

	const rows = [
		row('Creation Date', simulation.creationDate.toLocaleString()),
		row('UUID', simulation.uuid),
		row('State', simulation.status),
		row(
			'Estimated time',
			<Countdown date={simulation.estimatedTime} />,
			!!simulation.estimatedTime
		),
		row('Counted', simulation.counted, !!simulation.counted),
		row('Message', simulation.message, !!simulation.message)
	];

	const statusColor = (status: StatusState) => {
		switch (status) {
			case StatusState.FAILURE:
				return 'red';
			case StatusState.PROGRESS:
				return 'blue';
			case StatusState.SUCCESS:
				return 'green';
			default:
				return 'black';
		}
	};

	const onClickLoadResults = () => {
		loadResults?.call(null, simulation.uuid);
	};

	const onClickGoToResults = () => {
		loadResults?.call(null, null);
	};

	const onClickInputFiles = () => {
		showInputFiles(simulation.inputFiles);
	};

	const onClickShowError = () => {
		const errorWindow = window.open();

		if (!errorWindow) return console.error('Could not open new window');
		errorWindow.document.open();
		errorWindow.document.write(
			`<html>
			<head>
				<title>Log File</title>
			</head>
			<body>
			<h1>Log File</h1>
			<pre>${simulation?.logFile}</pre>
			</body>
			</html>`
		);
		errorWindow.document.close();
	};

	return (
		<Card sx={{ minWidth: 275 }}>
			<CardContent>
				<Typography
					gutterBottom
					variant='h5'
					component='div'
					color={statusColor(simulation.status)}>
					Simulation: {simulation.name}
				</Typography>
				<TableContainer component={Paper}>
					<Table aria-label='simple table'>
						<TableBody>{rows}</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
			<CardActions>
				{simulation.inputFiles && (
					<Button size='small' onClick={onClickInputFiles}>
						Show Input Files
					</Button>
				)}
				{simulation.logFile && (
					<Button size='small' onClick={onClickShowError}>
						Show Error Log
					</Button>
				)}

				<Button
					sx={{
						display: simulation.status === StatusState.FAILURE ? 'none' : ''
					}}
					size='small'
					disabled={simulation.status !== StatusState.SUCCESS}
					onClick={
						resultsSimulationData?.uuid !== simulation.uuid
							? onClickLoadResults
							: onClickGoToResults
					}>
					{resultsSimulationData?.uuid !== simulation.uuid
						? 'Load Results'
						: 'Go to Results'}
				</Button>

				{simulation.status === StatusState.PROGRESS && (
					<Button size='small' disabled>
						Cancel Simulation
					</Button>
				)}
			</CardActions>
		</Card>
	);
}
