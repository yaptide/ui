import { Box, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import {
	currentJobStatusData,
	currentTaskStatusData,
	JobUnknownStatus,
	SimulationInfo,
	StatusState,
	TaskUnknownStatus
} from '../../../../types/ResponseTypes';
import { millisecondsToTimeString } from '../../../../util/time';

interface SimulationCardContentProps {
	duration: number;
	endTime?: string | undefined;
	formatedEndDate: string;
	formatedStartDate: string;
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
	highlightColor: string;
}

function getValidatedPrimaries(primariesNumber: number | undefined): number {
	return primariesNumber ?? 0;
}

function calculateSimulationMetrics(jobTasksStatus: TaskUnknownStatus[], duration: number) {
	if (jobTasksStatus.length === 0) {
		return { progress: 0, eta: null, remaining: 0 };
	}

	const { requestedSum, simulatedSum } = jobTasksStatus.reduce(
		(acc, task) => {
			acc.requestedSum += getValidatedPrimaries(task.requestedPrimaries);
			acc.simulatedSum += getValidatedPrimaries(task.simulatedPrimaries);

			return acc;
		},
		{ requestedSum: 0, simulatedSum: 0 }
	);

	const progress = requestedSum > 0 ? Math.min(100, (simulatedSum / requestedSum) * 100) : 0;
	const remaining = Math.max(0, requestedSum - simulatedSum);

	// ETA calculation: (Remaining Work) * (Time Spent / Work Done)
	let eta = null;

	if (simulatedSum > 0 && remaining > 0 && duration > 0) {
		const msPerPrimary = duration / simulatedSum;
		eta = remaining * msPerPrimary;
	}

	return { progress, eta, remaining };
}

function needsProgressBar(state: StatusState | undefined) {
	return (
		state === StatusState.RUNNING ||
		state === StatusState.MERGING_QUEUED ||
		state === StatusState.MERGING_RUNNING
	);
}

export function SimulationProgress(props: {
	formatedStartDate: string;
	duration: number;
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
}) {
	const { formatedStartDate, duration, simulationStatus } = props;

	const [metrics, setMetrics] = useState({
		progress: 0,
		eta: null as number | null,
		remaining: 0
	});

	useEffect(() => {
		if (simulationStatus.jobTasksStatus) {
			const results = calculateSimulationMetrics(simulationStatus.jobTasksStatus, duration);
			setMetrics(results);
		}
	}, [simulationStatus, duration]);

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
					mb: 0.5
				}}>
				<Box>
					<Typography
						variant='caption'
						display='block'
						color='textDisabled'>
						Start: {formatedStartDate}
					</Typography>
					{metrics.remaining > 0 && (
						<Typography
							variant='caption'
							sx={{ fontWeight: 'bold' }}
							color='primary'>
							{metrics.remaining.toLocaleString()} left
						</Typography>
					)}
				</Box>
				<Box sx={{ textAlign: 'right' }}>
					{metrics.eta !== null && metrics.eta > 0 && (
						<Typography
							variant='caption'
							display='block'
							color='info.main'
							sx={{ fontWeight: 'bold' }}>
							ETA: ~{millisecondsToTimeString(metrics.eta)}
						</Typography>
					)}
					<Typography
						variant='caption'
						color='textDisabled'>
						Elapsed: {millisecondsToTimeString(duration)}
					</Typography>
				</Box>
			</Box>
			<LinearProgress
				variant='buffer'
				sx={{
					'height': 18,
					'mb': 1,
					'& .MuiLinearProgress-dashed': {
						overflow: 'hidden',
						backgroundSize: '5.75px 5.75px',
						animationDuration: '2s'
					}
				}}
				value={metrics.progress}
				valueBuffer={1}
			/>
		</>
	);
}

export const SimulationCardContent = ({
	duration,
	endTime,
	formatedEndDate,
	formatedStartDate,
	simulationStatus,
	highlightColor
}: SimulationCardContentProps) => {
	return (
		<CardContent sx={{ flexGrow: 1, p: 0, px: 1 }}>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 1,
					mb: 1
				}}>
				<Chip
					variant='filled'
					size='small'
					label={
						simulationStatus.localData ? StatusState.LOCAL : simulationStatus.jobState
					}
					sx={{ backgroundColor: highlightColor, color: 'white' }}
				/>
				{currentJobStatusData['hasSpecificProperty'](
					simulationStatus,
					'jobTasksStatus'
				) && (
					<>
						<Chip
							variant='outlined'
							size='small'
							label={`primaries: ${simulationStatus.jobTasksStatus.reduce(
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
							size='small'
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
								size='small'
								label={`${key}: ${value}`}
							/>
						))}
			</Box>
			<Box sx={{ minHeight: '40px' }}>
				{needsProgressBar(simulationStatus.jobState)
					? currentJobStatusData['hasSpecificProperty'](
							simulationStatus,
							'jobTasksStatus'
						) && (
							<SimulationProgress
								formatedStartDate={formatedStartDate}
								duration={duration}
								simulationStatus={simulationStatus}
							/>
						)
					: simulationStatus.jobState === StatusState.COMPLETED && (
							<>
								<Typography color='textDisabled'>
									Start: {formatedStartDate}
								</Typography>
								{endTime && (
									<Typography color='textDisabled'>
										End: {formatedEndDate}
									</Typography>
								)}
								<Typography color='textDisabled'>
									Duration: {millisecondsToTimeString(duration)}
								</Typography>
							</>
						)}
			</Box>
		</CardContent>
	);
};
