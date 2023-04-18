import {
	Box,
	Button,
	ButtonGroup,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardProps,
	Chip,
	Divider,
	LinearProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import React, { ReactNode, useMemo } from 'react';
import { useLoader } from '../../../services/DataLoaderService';
import {
	InputFiles,
	JobStatusData,
	StatusState,
	currentJobStatusData,
	currentTaskStatusData
} from '../../../services/ResponseTypes';
import { useStore } from '../../../services/StoreService';
import { saveString } from '../../../util/File';
import { SimulationProgressBar } from './SimulationProgressBar';
type SimulationCardProps = {
	simulation: JobStatusData;
	loadResults?: (jobId: string | null) => void;
	showInputFiles?: (inputFiles?: InputFiles) => void;
} & CardProps;

const tableRowStyle: SxProps<Theme> = { '&:last-child td, &:last-child th': { border: 0 } };
const row = (id: number, title: string, value: string | undefined | ReactNode, guard = true) => (
	<React.Fragment key={id}>
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

export default function SimulationCard({
	simulation,
	loadResults,
	showInputFiles,
	...other
}: SimulationCardProps) {
	const { resultsSimulationData } = useStore();
	const { loadFromJson } = useLoader();

	const rows = useMemo(() => {
		const rows: any[] = [];
		if (currentJobStatusData[StatusState.RUNNING](simulation)) {
			row(0, 'Message', simulation.message, !!simulation.message);
		}
		return rows;
	}, [simulation]);

	const statusColor = (status?: StatusState) => {
		switch (status) {
			case StatusState.FAILED:
				return 'error.main';
			case StatusState.RUNNING:
				return 'info.main';
			case StatusState.COMPLETED:
				return 'success.main';
			case StatusState.LOCAL:
				return 'warning.main';
			default:
				return '';
		}
	};

	const onClickLoadResults = () => {
		loadResults?.call(null, simulation.jobId);
	};

	const onClickGoToResults = () => {
		loadResults?.call(null, null);
	};

	const onClickInputFiles = () => {
		showInputFiles?.call(null, simulation.inputFiles);
	};

	const onClickShowError = (simulation: JobStatusData<StatusState.FAILED>) => {
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
			<pre>${simulation.logfile}</pre>
			</body>
			</html>`
		);
		errorWindow.document.close();
	};

	const onClickSaveToFile = () => {
		saveString(JSON.stringify(simulation), `${simulation.title}_result.json`);
	};

	const onClickLoadToEditor = (simulation: JobStatusData<StatusState.COMPLETED>) => {
		if (!simulation?.inputJson) return;
		loadFromJson(simulation.inputJson);
	};

	return (
		<Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} {...other}>
			<Divider
				sx={{
					borderTopWidth: 5,
					borderColor: statusColor(
						simulation.localData ? StatusState.LOCAL : simulation.jobState
					)
				}}
			/>
			<CardHeader
				title={`${
					currentJobStatusData[StatusState.COMPLETED](simulation)
						? simulation.inputJson?.project.title
						: simulation.title
				}`}
				subheader={`${simulation.startTime.toLocaleString('en-US').split(' ')[0]} ${
					simulation.startTime.toLocaleString('en-US').split(' ')[4] ?? '00:00:00'
				} - ${
					currentJobStatusData[StatusState.COMPLETED](simulation) && simulation.endTime
						? simulation.endTime.toLocaleString('en-US').split(' ')[4] ?? '?'
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
						label={simulation.localData ? StatusState.LOCAL : simulation.jobState}
						sx={{
							borderColor: statusColor(
								simulation.localData ? StatusState.LOCAL : simulation.jobState
							)
						}}
					/>
					{currentJobStatusData['hasSpecificProperty'](simulation, 'jobTasksStatus') && (
						<>
							<Chip
								variant='outlined'
								label={`requestedPrimaries: ${simulation.jobTasksStatus.reduce(
									(acc, taskStatus) =>
										currentTaskStatusData['hasSpecificProperty'](
											taskStatus,
											'requestedPrimaries'
										)
											? acc + taskStatus.requestedPrimaries
											: acc,
									0 as number
								)}`}
							/>
							<Chip
								variant='outlined'
								label={`ntask: ${simulation.jobTasksStatus.length}`}
							/>
						</>
					)}
					{simulation.metadata &&
						Object.entries(simulation.metadata)
							.filter(([key, value]) => key !== 'type')
							.map(([key, value]) => (
								<Chip key={key} variant='outlined' label={`${key}: ${value}`} />
							))}
				</Box>
				<TableContainer
					component={Paper}
					sx={{
						'& .MuiTableRow-root': {
							backgroundColor: theme =>
								theme.palette.mode === 'dark'
									? 'rgba(255, 255, 255, 0.05)'
									: 'rgba(0, 0, 0, 0.05)'
						}
					}}>
					<Table aria-label='simple table'>
						<TableBody>{rows}</TableBody>
					</Table>
				</TableContainer>
				{currentJobStatusData['hasSpecificProperty'](simulation, 'jobTasksStatus') && (
					<>
						<LinearProgress
							variant='buffer'
							sx={{ height: 16, mb: 1 }}
							valueBuffer={
								Math.max(
									...simulation.jobTasksStatus.map(
										status =>
											(status?.simulatedPrimaries ?? 0) /
											(status?.requestedPrimaries ?? 1)
									)
								) * 100
							}
							value={
								(simulation.jobTasksStatus.reduce(
									(acc, status) =>
										acc +
										(status?.simulatedPrimaries ?? 0) /
											(status?.requestedPrimaries ?? 1),
									0 as number
								) /
									(simulation.jobTasksStatus.length ?? 1)) *
								100
							}
						/>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))'
							}}>
							{simulation.jobTasksStatus.map((taskStatus, index) => (
								<SimulationProgressBar key={index} status={taskStatus} />
							))}
						</Box>
					</>
				)}
			</CardContent>
			<CardActions>
				<ButtonGroup fullWidth aria-label='full width outlined button group'>
					{simulation.jobState &&
						(() => {
							if (currentJobStatusData[StatusState.COMPLETED](simulation)) {
								return (
									<Button
										sx={{ fontSize: '.8em' }}
										size='small'
										color='info'
										onClick={
											resultsSimulationData?.jobId !== simulation.jobId
												? onClickLoadResults
												: onClickGoToResults
										}>
										{resultsSimulationData?.jobId !== simulation.jobId
											? 'Load Results'
											: 'Go to Results'}
									</Button>
								);
							} else if (
								currentJobStatusData[StatusState.RUNNING](simulation) ||
								currentJobStatusData[StatusState.PENDING](simulation)
							) {
								return (
									<Button
										sx={{ fontSize: '.8em' }}
										color='info'
										size='small'
										disabled={true}>
										Cancel
									</Button>
								);
							} else if (currentJobStatusData[StatusState.FAILED](simulation)) {
								return (
									<Button
										sx={{ fontSize: '.8em' }}
										color='info'
										size='small'
										onClick={() => onClickShowError(simulation)}>
										Error Log
									</Button>
								);
							}
							return <></>;
						})()}

					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						onClick={onClickInputFiles}
						disabled={
							!Boolean(
								currentJobStatusData[StatusState.COMPLETED](simulation) ||
									(currentJobStatusData[StatusState.FAILED](simulation) &&
										showInputFiles)
							)
						}>
						Input Files
					</Button>

					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						onClick={onClickSaveToFile}
						disabled={!Boolean(simulation.jobState === StatusState.COMPLETED)}>
						Save to file
					</Button>
					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						onClick={() =>
							currentJobStatusData[StatusState.COMPLETED](simulation) &&
							onClickLoadToEditor(simulation)
						}
						disabled={
							!Boolean(
								currentJobStatusData[StatusState.COMPLETED](simulation) &&
									simulation.inputJson
							)
						}>
						Load to editor
					</Button>
				</ButtonGroup>
			</CardActions>
		</Card>
	);
}
