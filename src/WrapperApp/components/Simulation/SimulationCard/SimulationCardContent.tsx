import {
	Box,
	CardContent,
	Chip,
	LinearProgress,
	Paper,
	Table,
	TableBody,
	TableContainer
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import {
	currentJobStatusData,
	currentTaskStatusData,
	JobUnknownStatus,
	SimulationInfo,
	StatusState
} from '../../../../types/ResponseTypes';
import { SimulationProgressBar } from '../SimulationProgressBar';
import { useRows } from './RowUtils';

interface SimulationCardContentProps {
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
	statusColor: (status?: StatusState | undefined) => string;
}

export const SimulationCardContent = ({
	simulationStatus,
	statusColor
}: SimulationCardContentProps) => {
	const rows = useRows(simulationStatus);
	const [simulationValue, setSimulationValue] = useState(0);

	useEffect(() => {
		console.log(simulationStatus);
	}, [simulationStatus]);

	const isJobDataMissing = (jobStatus: any): boolean => {
		return !jobStatus?.simulatedPrimaries || !jobStatus?.requestedPrimaries;
	};

	const calculateJobCompletion = (jobStatus: any): number => {
		if (isJobDataMissing(jobStatus)) {
			return 0;
		}

		return jobStatus.simulatedPrimaries / jobStatus.requestedPrimaries;
	};

	const calculateSimulationCompletition = (simulationStatus: any): number => {
		const jobs_num = simulationStatus.jobTasksStatus.length ?? 1;
		const jobs_completion_sum = simulationStatus.jobTasksStatus
			.map((status: any) => calculateJobCompletion(status))
			.reduce((acc: number, job_completion: number) => acc + job_completion, 0);

		return (jobs_completion_sum / jobs_num) * 100;
	};

	useEffect(() => {
		if (simulationStatus.jobTasksStatus) {
			setSimulationValue(calculateSimulationCompletition(simulationStatus));
		}
	}, [simulationStatus, setSimulationValue]);

	return (
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
						simulationStatus.localData ? StatusState.LOCAL : simulationStatus.jobState
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
			{currentJobStatusData['hasSpecificProperty'](simulationStatus, 'jobTasksStatus') && (
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
						valueBuffer={0}
						value={simulationValue}
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
	);
};
