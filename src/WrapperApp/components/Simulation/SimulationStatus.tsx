import {
	Button,
	Card,
	CardActions,
	CardContent,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Typography
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import React, { ReactNode } from 'react';
import Countdown from 'react-countdown';
import {
	InputFiles,
	SimulationStatusData,
	StatusState
} from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { saveString } from '../../../util/File';

interface SimulationStatusProps {
	simulation: SimulationStatusData;
	loadResults?: (taskId: string | null) => void;
	showInputFiles?: (inputFiles?: InputFiles) => void;
}

export default function SimulationStatus({
	simulation,
	loadResults,
	showInputFiles
}: SimulationStatusProps) {
	const { resultsSimulationData } = useStore();

	const tableRowStyle: SxProps<Theme> = { '&:last-child td, &:last-child th': { border: 0 } };

	const row = (title: string, value: string | undefined | ReactNode, guard = true) => (
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
		showInputFiles?.call(null, simulation.inputFiles);
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

	const onClickSaveToFile = () => {
		saveString(JSON.stringify(simulation), `${simulation.name}_result.json`);
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
				{simulation.inputFiles && showInputFiles && (
					<Button color='info' size='small' onClick={onClickInputFiles}>
						Show Input Files
					</Button>
				)}
				{simulation.logFile && (
					<Button color='info' size='small' onClick={onClickShowError}>
						Show Error Log
					</Button>
				)}

				<Button
					sx={{
						display: simulation.status === StatusState.FAILURE ? 'none' : ''
					}}
					size='small'
					color='info'
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

				{simulation.status === StatusState.SUCCESS && (
					<Button color='info' size='small' onClick={onClickSaveToFile}>
						Save to file
					</Button>
				)}

				{simulation.status === StatusState.PROGRESS && (
					<Button color='info' size='small' disabled>
						Cancel Simulation
					</Button>
				)}
			</CardActions>
		</Card>
	);
}
