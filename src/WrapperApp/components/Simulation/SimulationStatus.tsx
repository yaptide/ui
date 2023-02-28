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
import React, { ReactNode, useMemo } from 'react';
import Countdown from 'react-countdown';
import { useLoader } from '../../../services/DataLoaderService';
import { InputFiles } from '../../../services/RequestTypes';
import {
	JobStatusData,
	StatusState,
	TaskTime,
	currentJobStatusData,
	currentTaskStatusData
} from '../../../services/ResponseTypes';
import { useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { saveString } from '../../../util/File';
interface SimulationStatusProps {
	simulation: JobStatusData;
	loadResults?: (job_id: string | null) => void;
	showInputFiles?: (inputFiles?: InputFiles) => void;
}

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

export default function SimulationStatus({
	simulation,
	loadResults,
	showInputFiles
}: SimulationStatusProps) {
	const { resultsSimulationData } = useStore();
	const { cancelJob: cancelSimulation } = useShSimulation();
	const { loadFromJson } = useLoader();

	const getDateFromEstimation = (estimated?: TaskTime) => {
		if (!estimated) return undefined;
		const { hours, minutes, seconds } = estimated;
		const date =
			Date.now() +
			(parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
		return date;
	};

	const rows = useMemo(() => {
		const rows: any[] = [];
		if (currentJobStatusData[StatusState.RUNNING](simulation)) {
			for (const task of simulation.jobTasksStatus) {
				if (currentTaskStatusData[StatusState.RUNNING](task)) {
					const date = getDateFromEstimation(task.estimatedTime);
					const primaries = task.taskInfo.simulatedPrimaries;
					rows.push(
						row(
							task.taskId,
							'Estimated time',
							<Countdown date={date} />,
							date !== undefined && date > 0
						)
					);
					rows.push(row(0, 'Counted', primaries, !!primaries));
				}
			}
			row(-1, 'Message', simulation.message, !!simulation.message);
		}
		return rows;
	}, [simulation]);

	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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

	const onClickInputFiles = (
		simulation: JobStatusData<StatusState.COMPLETED | StatusState.FAILED>
	) => {
		// console.log(simulation);
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
		saveString(JSON.stringify(simulation), `${simulation.name}_result.json`);
	};

	const onClickLoadToEditor = (simulation: JobStatusData<StatusState.COMPLETED>) => {
		if (!simulation?.inputJson) return;
		loadFromJson(simulation.inputJson);
	};

	return (
		<Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<Divider
				sx={{
					borderTopWidth: 5,
					borderColor: statusColor(simulation.jobState)
				}}
			/>
			<CardHeader
				title={`${simulation.inputJson?.project.title ?? simulation.name}`}
				subheader={`${simulation.startTime.toLocaleString('en-US').split(' ')[0]} ${
					simulation.startTime?.toTimeString
						? simulation.startTime.toTimeString().split(' ')[0]
						: '00:00:00'
				} - ${
					simulation.jobState === StatusState.COMPLETED &&
					simulation.endTime?.toTimeString
						? simulation.endTime.toTimeString().split(' ')[0]
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
						label={simulation.jobState}
						sx={{
							borderColor: statusColor(simulation.jobState)
						}}
					/>
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
					{simulation.jobState &&
						(() => {
							if (
								currentJobStatusData[StatusState.COMPLETED](simulation) ||
								currentJobStatusData[StatusState.LOCAL](simulation)
							) {
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
										onClick={() => cancelSimulation(simulation)}
										disabled={simulation.jobState === StatusState.PENDING}>
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
						onClick={() =>
							currentJobStatusData[StatusState.COMPLETED](simulation) ||
							(currentJobStatusData[StatusState.FAILED](simulation) &&
								onClickInputFiles(simulation))
						}
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
