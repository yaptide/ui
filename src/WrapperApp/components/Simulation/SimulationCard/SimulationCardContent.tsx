import { Box, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { JobUnknownStatus, SimulationInfo, StatusState } from '../../../../types/ResponseTypes';
import { clusterBusyLabel } from '../../../../util/clusterBusy';
import { partialResultsLabel } from '../../../../util/partialResults';
import { TaskTotals, taskTotals } from '../../../../util/taskTotals';
import { millisecondsToTimeString } from '../../../../util/time';

interface SimulationCardContentProps {
	duration: number;
	endTime?: string | undefined;
	formatedEndDate: string;
	formatedStartDate: string;
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
	highlightColor: string;
}

function simulationProgress(totals: TaskTotals | undefined): number {
	if (!totals || totals.requestedPrimaries <= 0) return 0;

	return Math.min(100, (totals.simulatedPrimaries / totals.requestedPrimaries) * 100);
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
		setSimulationProgressPercent(simulationProgress(taskTotals(simulationStatus)));
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
	const totals = taskTotals(simulationStatus);
	const partialLabel = partialResultsLabel(simulationStatus);
	const busyLabel = clusterBusyLabel(simulationStatus);

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
				{totals && (
					<>
						<Chip
							variant='outlined'
							size='small'
							label={`primaries: ${totals.requestedPrimaries}`}
						/>
						<Chip
							variant='outlined'
							size='small'
							label={`ntask: ${totals.ntasks}`}
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
					? totals && (
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
				{partialLabel && (
					<Typography color='textDisabled'>Partial results: {partialLabel}</Typography>
				)}
				{busyLabel && <Typography color='warning.main'>{busyLabel}</Typography>}
				{busyLabel && simulationStatus.clusterNotice && (
					<Typography
						variant='caption'
						color='textSecondary'
						sx={{ whiteSpace: 'pre-line' }}>
						{simulationStatus.clusterNotice}
					</Typography>
				)}
			</Box>
		</CardContent>
	);
};
