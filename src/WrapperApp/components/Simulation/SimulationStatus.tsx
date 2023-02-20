import {
	Box,
	Button,
	ButtonGroup,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Chip,
	Divider,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	useMediaQuery
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import React, { ReactNode } from 'react';
import Countdown from 'react-countdown';
import { useLoader } from '../../../services/DataLoaderService';
import {
	InputFiles,
	SimulationInfo,
	SimulationStatusData,
	StatusState
} from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { saveString } from '../../../util/File';
import { useShSimulation } from '../../../services/ShSimulatorService';
interface SimulationStatusProps {
	simulation: SimulationStatusData;
	info?: SimulationInfo;
	loadResults?: (job_id: string | null) => void;
	showInputFiles?: (inputFiles?: InputFiles) => void;
}

export default function SimulationStatus({
	simulation,
	info,
	loadResults,
	showInputFiles
}: SimulationStatusProps) {
	const { resultsSimulationData } = useStore();
	const { cancelSimulation } = useShSimulation();
	const { loadFromJson } = useLoader();

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
		row(
			'Estimated time',
			<Countdown date={simulation.estimatedTime} />,
			!!simulation.estimatedTime
		),
		row('Counted', simulation.counted, !!simulation.counted),
		row('Message', simulation.message, !!simulation.message)
	];

	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const statusColor = (status: StatusState) => {
		switch (status) {
			case StatusState.FAILURE:
				return 'error.main';
			case StatusState.PROGRESS:
				return 'info.main';
			case StatusState.SUCCESS:
				return 'success.main';
			case StatusState.LOCAL:
				return 'warning.main';
			default:
				return '';
		}
	};

	const onClickLoadResults = () => {
		loadResults?.call(null, simulation.uuid);
	};

	const onClickGoToResults = () => {
		loadResults?.call(null, null);
	};

	const onClickInputFiles = () => {
		console.log(simulation);
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

	const onClickLoadToEditor = () => {
		if (!simulation?.editor) return;
		loadFromJson(simulation.editor);
	};

	return (
		<Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Divider
				sx={{
					borderTopWidth: 5,
					borderColor: statusColor(simulation.status)
				}}
			/>
			<CardHeader
				title={`${simulation.name}`}
				subheader={`${simulation.creationDate.toLocaleString('en-US').split(' ')[0]} ${
					simulation.creationDate?.toTimeString
						? simulation.creationDate.toTimeString().split(' ')[0]
						: '00:00:00'
				} - ${
					simulation.status === StatusState.SUCCESS &&
					simulation.completionDate?.toTimeString
						? simulation.completionDate.toTimeString().split(' ')[0]
						: '?'
				}`}
			/>
			<CardContent sx={{ flexGrow: 1 }}>
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: 1,
						mb: 2
					}}>
					<Chip
						variant='outlined'
						label={simulation.status}
						sx={{
							borderColor: statusColor(simulation.status)
						}}
					/>
					{simulation.metadata &&
						Object.entries(simulation.metadata)
							.filter(([key, value]) => key !== 'type')
							.map(([key, value]) => (
								<Chip key={key} variant='outlined' label={`${key}: ${value}`} />
							))}
					<Chip variant='outlined' label={`cores: ${simulation.cores}`} />
				</Box>
				<TableContainer
					component={Paper}
					sx={{
						'& .MuiTableRow-root': {
							backgroundColor: prefersDarkMode
								? 'rgba(255, 255, 255, 0.05)'
								: 'rgba(0, 0, 0, 0.05)'
						}
					}}>
					<Table aria-label='simple table'>
						<TableBody>{rows}</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
			<CardActions>
				<ButtonGroup fullWidth aria-label='full width outlined button group'>
					{[StatusState.SUCCESS, StatusState.LOCAL].includes(simulation.status) && (
						<Button
							sx={{ fontSize: '.8em' }}
							size='small'
							color='info'
							onClick={
								resultsSimulationData?.uuid !== simulation.uuid
									? onClickLoadResults
									: onClickGoToResults
							}>
							{resultsSimulationData?.uuid !== simulation.uuid
								? 'Load Results'
								: 'Go to Results'}
						</Button>
					)}
					{[StatusState.PROGRESS, StatusState.PENDING].includes(simulation.status) &&
						info && (
							<Button
								sx={{ fontSize: '.8em' }}
								color='info'
								size='small'
								onClick={() => cancelSimulation(info)}
								disabled={simulation.status === StatusState.PENDING}>
								Cancel
							</Button>
						)}
					{simulation.status === StatusState.FAILURE && (
						<Button
							sx={{ fontSize: '.8em' }}
							color='info'
							size='small'
							onClick={onClickShowError}>
							Error Log
						</Button>
					)}
					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						onClick={onClickInputFiles}
						disabled={!Boolean(simulation.inputFiles && showInputFiles)}>
						Input Files
					</Button>

					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						onClick={onClickSaveToFile}
						disabled={!Boolean(simulation.status === StatusState.SUCCESS)}>
						Save to file
					</Button>
					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						onClick={onClickLoadToEditor}
						disabled={
							!Boolean(simulation.status === StatusState.SUCCESS && simulation.editor)
						}>
						Load to editor
					</Button>
				</ButtonGroup>
			</CardActions>
		</Card>
	);
}
