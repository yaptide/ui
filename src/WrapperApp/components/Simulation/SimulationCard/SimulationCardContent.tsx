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

function percentOfSimulatedPrimaries(
	requestedPrimariesSum: number,
	simulatedPrimariesSum: number
): number {
	return requestedPrimariesSum > 0
		? Math.min(100, (simulatedPrimariesSum / requestedPrimariesSum) * 100)
		: 0;
}

function calculateSimulationProgress(jobTasksStatus: TaskUnknownStatus[]): number {
	if (jobTasksStatus.length === 0) {
		return 0;
	}

	const { requestedPrimariesSum, simulatedPrimariesSum } = jobTasksStatus.reduce(
		(
			acc: { requestedPrimariesSum: number; simulatedPrimariesSum: number },
			taskStatus: TaskUnknownStatus
		) => {
			acc.requestedPrimariesSum += getValidatedPrimaries(taskStatus.requestedPrimaries);
			acc.simulatedPrimariesSum += getValidatedPrimaries(taskStatus.simulatedPrimaries);

			return acc;
		},
		{ requestedPrimariesSum: 0, simulatedPrimariesSum: 0 }
	);

	return percentOfSimulatedPrimaries(requestedPrimariesSum, simulatedPrimariesSum);
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

	const [simulationProgressPercent, setSimulationProgressPercent] = useState(0);

	useEffect(() => {
		if (simulationStatus.jobTasksStatus) {
			const jobTasksStatus = simulationStatus.jobTasksStatus;
			setSimulationProgressPercent(calculateSimulationProgress(jobTasksStatus));
		}
	}, [simulationStatus, setSimulationProgressPercent]);

	return (
		<>
			<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
				<Typography color='textDisabled'>Start: {formatedStartDate}</Typography>
				<Typography color='textDisabled'>{millisecondsToTimeString(duration)}</Typography>
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
				value={simulationProgressPercent}
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
