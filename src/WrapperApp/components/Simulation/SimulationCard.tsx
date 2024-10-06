import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
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
	IconButton,
	LinearProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Tooltip
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { formatDate } from 'date-fns/format';
import { useSnackbar } from 'notistack';
import { Fragment, ReactNode, useMemo, useState } from 'react';

import { useDialog } from '../../../services/DialogService';
import { useLoader } from '../../../services/LoaderService';
import { FullSimulationData, useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { titleToKebabCase } from '../../../ThreeEditor/components/Dialog/CustomDialog';
import {
	currentJobStatusData,
	currentTaskStatusData,
	JobStatusData,
	SimulationInputFiles,
	StatusState
} from '../../../types/ResponseTypes';
import { millisecondsToTimeString } from '../../../util/time';
import { SimulationProgressBar } from './SimulationProgressBar';

type SimulationCardProps = {
	simulationStatus: JobStatusData;
	loadResults?: (jobId: string | null) => void;
	handleDelete?: (jobId: string) => void;
	handleCancel?: (jobId: string) => void;
	handleRefresh?: (jobId: string) => void;
	showInputFiles?: (inputFiles?: SimulationInputFiles) => void;
} & CardProps;

const tableRowStyle: SxProps<Theme> = { '&:last-child td, &:last-child th': { border: 0 } };
const row = (id: number, title: string, value: string | undefined | ReactNode, guard = true) => (
	<Fragment key={id}>
		{guard && (
			<TableRow sx={tableRowStyle}>
				<TableCell
					component='th'
					scope='row'>
					{title}
				</TableCell>
				<TableCell align='right'>{value}</TableCell>
			</TableRow>
		)}
	</Fragment>
);

export default function SimulationCard({
	simulationStatus,
	loadResults,
	handleDelete,
	handleCancel,
	handleRefresh,
	showInputFiles,
	...other
}: SimulationCardProps) {
	const { yaptideEditor, resultsSimulationData } = useStore();
	const { loadFromJson } = useLoader();
	const { getJobLogs, getJobInputs, getFullSimulationData } = useShSimulation();
	const { enqueueSnackbar } = useSnackbar();
	const { open: openSaveFileDialog } = useDialog('saveFile');

	const [disableLoadJson, setDisableLoadJson] = useState(false);

	const rows = useMemo(() => {
		const rows: JSX.Element[] = [];

		if (currentJobStatusData[StatusState.RUNNING](simulationStatus)) {
			row(0, 'Message', simulationStatus.message, !!simulationStatus.message);
		}

		return rows;
	}, [simulationStatus]);

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
			case StatusState.CANCELED:
				return 'common.black';
			default:
				return '';
		}
	};

	const onClickLoadResults = () => {
		loadResults?.call(null, simulationStatus.jobId);
	};

	const onClickGoToResults = () => {
		loadResults?.call(null, null);
	};

	const onClickInputFiles = async () => {
		const inputFiles = await getJobInputs(simulationStatus);

		showInputFiles?.call(null, inputFiles?.input.inputFiles);
	};

	const onClickShowError = async (simulation: JobStatusData<StatusState.FAILED>) => {
		const errorWindow = window.open();

		const logfile = await getJobLogs(simulation);
		const logfiles = Object.entries(logfile?.logfiles ?? {}).map(([key, value]) => {
			return `<details><summary><h2 style="display: inline;">${key}</h2></summary><pre>${value}</pre></details>`;
		});

		if (!errorWindow) return console.error('Could not open new window');
		errorWindow.document.open();
		errorWindow.document.write(
			`<html>
			<head>
				<title>Log Files</title>
			</head>
			<body>
			<h1>Log Files</h1>
			${logfiles}
			</body>
			</html>`
		);
		errorWindow.document.close();
	};

	const onClickSaveToFile = () => {
		getFullSimulationData(simulationStatus)
			.then((simulation: FullSimulationData | undefined) => {
				if (yaptideEditor)
					openSaveFileDialog({
						name: `${titleToKebabCase(simulation?.title ?? 'simulation')}-result.json`,
						results: simulation,
						disableCheckbox: true,
						yaptideEditor
					});
			})
			.catch(() => {
				enqueueSnackbar('Could not load simulation data', { variant: 'error' });
			});
	};

	const onClickLoadToEditor = async (simulation: JobStatusData) => {
		const inputJson = (await getJobInputs(simulation))?.input.inputJson;

		if (!inputJson) {
			setDisableLoadJson(true);

			return enqueueSnackbar('Could not load json file', { variant: 'error' });
		}

		loadFromJson(inputJson);
	};

	const { startTime, endTime } = simulationStatus;

	const startDate = new Date(startTime);
	const endDate = endTime ? new Date(endTime) : new Date();
	const duration = endDate ? endDate.valueOf() - startDate.valueOf() : 0;

	const formatDateTime = (date: Date) => formatDate(date, 'yyyy-MM-dd HH:mm:ss');

	const displayDuration = endTime || currentJobStatusData[StatusState.RUNNING](simulationStatus);

	return (
		<Card
			sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
			{...other}>
			<Divider
				sx={{
					borderTopWidth: 5,
					borderColor: statusColor(
						simulationStatus.localData ? StatusState.LOCAL : simulationStatus.jobState
					)
				}}
			/>
			<CardHeader
				title={`${simulationStatus.title}`}
				subheader={
					<>
						<Box>Start: {formatDateTime(startDate)}</Box>
						{endTime ? <Box>End: {formatDateTime(endDate)}</Box> : ''}
						{displayDuration ? (
							<Box>Duration: {millisecondsToTimeString(duration)}</Box>
						) : (
							''
						)}
					</>
				}
				action={
					handleDelete &&
					(currentJobStatusData[StatusState.COMPLETED](simulationStatus) ||
						currentJobStatusData[StatusState.FAILED](simulationStatus)) ? (
						<Tooltip
							title='Delete simulation'
							sx={{
								zIndex: ({ zIndex }) => zIndex.appBar
							}}>
							<IconButton
								aria-label='delete simulation'
								onClick={() => handleDelete(simulationStatus.jobId)}>
								<ClearIcon />
							</IconButton>
						</Tooltip>
					) : handleRefresh ? (
						<Tooltip
							title='Refresh status'
							sx={{
								zIndex: ({ zIndex }) => zIndex.appBar
							}}>
							<IconButton
								aria-label='refresh simulation'
								onClick={() => handleRefresh(simulationStatus.jobId)}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					) : undefined
				}
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
						label={
							simulationStatus.localData
								? StatusState.LOCAL
								: simulationStatus.jobState
						}
						sx={{
							borderColor: statusColor(
								simulationStatus.localData
									? StatusState.LOCAL
									: simulationStatus.jobState
							)
						}}
					/>
					{currentJobStatusData['hasSpecificProperty'](
						simulationStatus,
						'jobTasksStatus'
					) && (
						<>
							<Chip
								variant='outlined'
								label={`requestedPrimaries: ${simulationStatus.jobTasksStatus.reduce(
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
								label={`ntask: ${simulationStatus.jobTasksStatus.length}`}
							/>
						</>
					)}
					{simulationStatus.metadata &&
						Object.entries(simulationStatus.metadata)
							.filter(([key, value]) => key !== 'type')
							.map(([key, value]) => (
								<Chip
									key={key}
									variant='outlined'
									label={`${key}: ${value}`}
								/>
							))}
				</Box>
				<TableContainer
					component={Paper}
					sx={{
						'& .MuiTableRow-root': {
							backgroundColor: ({ palette }: Theme) =>
								palette.mode === 'dark'
									? 'rgba(255, 255, 255, 0.05)'
									: 'rgba(0, 0, 0, 0.05)'
						}
					}}>
					<Table aria-label='simple table'>
						<TableBody>{rows}</TableBody>
					</Table>
				</TableContainer>
				{currentJobStatusData['hasSpecificProperty'](
					simulationStatus,
					'jobTasksStatus'
				) && (
					<>
						<LinearProgress
							variant='buffer'
							sx={{
								'height': 18,
								'mb': 1,
								'& .MuiLinearProgress-dashed': {
									overflow: 'hidden',
									backgroundSize: '5.75px 5.75px',
									animationDuration: '4s'
								}
							}}
							valueBuffer={
								Math.max(
									...simulationStatus.jobTasksStatus.map(
										status =>
											(status?.simulatedPrimaries ?? 0) /
											(status?.requestedPrimaries ?? 1)
									)
								) * 100
							}
							value={
								(simulationStatus.jobTasksStatus.reduce(
									(acc, status) =>
										acc +
										(status?.simulatedPrimaries ?? 0) /
											(status?.requestedPrimaries ?? 1),
									0 as number
								) /
									(simulationStatus.jobTasksStatus.length ?? 1)) *
								100
							}
						/>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))'
							}}>
							{simulationStatus.jobTasksStatus.map((taskStatus, index) => (
								<SimulationProgressBar
									key={index}
									status={taskStatus}
								/>
							))}
						</Box>
					</>
				)}
			</CardContent>
			<CardActions>
				<ButtonGroup
					fullWidth
					aria-label='full width outlined button group'>
					{simulationStatus.jobState &&
						(() => {
							if (currentJobStatusData[StatusState.COMPLETED](simulationStatus)) {
								return (
									<Button
										sx={{ fontSize: '.8em' }}
										size='small'
										color='info'
										disabled={!Boolean(loadResults)}
										onClick={
											resultsSimulationData?.jobId !== simulationStatus.jobId
												? onClickLoadResults
												: onClickGoToResults
										}>
										{resultsSimulationData?.jobId !== simulationStatus.jobId
											? 'Load Results'
											: 'Go to Results'}
									</Button>
								);
							} else if (
								handleCancel &&
								(currentJobStatusData[StatusState.RUNNING](simulationStatus) ||
									currentJobStatusData[StatusState.PENDING](simulationStatus))
							) {
								return (
									<Button
										sx={{ fontSize: '.8em' }}
										color='info'
										onClick={() => handleCancel(simulationStatus.jobId)}
										size='small'>
										Cancel
									</Button>
								);
							} else if (currentJobStatusData[StatusState.FAILED](simulationStatus)) {
								return (
									<Button
										sx={{ fontSize: '.8em' }}
										color='info'
										size='small'
										onClick={() => onClickShowError(simulationStatus)}>
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
						disabled={!Boolean(showInputFiles)}>
						Input Files
					</Button>

					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						onClick={onClickSaveToFile}
						disabled={
							!(simulationStatus.jobState === StatusState.COMPLETED && yaptideEditor)
						}>
						Save to file
					</Button>

					<Button
						sx={{ fontSize: '.8em' }}
						color='info'
						size='small'
						disabled={disableLoadJson}
						onClick={() => simulationStatus && onClickLoadToEditor(simulationStatus)}>
						Load to editor
					</Button>
				</ButtonGroup>
			</CardActions>
		</Card>
	);
}
