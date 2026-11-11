import { Box, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import { formatDate } from 'date-fns/format';

import {
	currentJobStatusData,
	currentTaskStatusData,
	JobUnknownStatus,
	SimulationInfo,
	StatusState
} from '../../../../types/ResponseTypes';
import { calculateSimulationProgress } from '../../../../util/simulationProgress';
import { millisecondsToTimeString } from '../../../../util/time';

interface SimulationCardContentProps {
	duration: number;
	endTime?: string | undefined;
	formatedEndDate: string;
	formatedStartDate: string;
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
	highlightColor: string;
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

	const metrics = calculateSimulationProgress(simulationStatus.jobTasksStatus ?? [], duration);

	const expectedEndTime =
		metrics.etaMilliseconds !== null ? new Date(Date.now() + metrics.etaMilliseconds) : null;

	const isRunning = simulationStatus.jobState === StatusState.RUNNING;

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
						sx={{
							display: 'block',
							color: 'primary',
							fontWeight: 'bold'
						}}>
						{metrics.progress.toFixed(0)}% Complete
					</Typography>
				</Box>

				{isRunning && metrics.etaMilliseconds !== null && (
					<Box sx={{ textAlign: 'right' }}>
						<Typography
							variant='caption'
							sx={{
								display: 'block',
								color: 'info.main',
								fontWeight: 'bold'
							}}>
							ETA: ~{millisecondsToTimeString(metrics.etaMilliseconds)}
						</Typography>
					</Box>
				)}
			</Box>

			<LinearProgress
				variant='buffer'
				value={metrics.progress}
				valueBuffer={1}
				sx={{
					'height': 18,
					'mb': 1,
					'& .MuiLinearProgress-dashed': {
						overflow: 'hidden',
						backgroundSize: '5.75px 5.75px',
						animationDuration: '2s'
					}
				}}
			/>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
					mb: 0.5
				}}>
				<Typography
					variant='caption'
					sx={{ color: 'textDisabled' }}>
					Start: {formatedStartDate}
				</Typography>

				{isRunning && expectedEndTime && (
					<Typography
						variant='caption'
						sx={{ color: 'textDisabled' }}>
						Expected end: {formatDate(expectedEndTime, 'yyyy-MM-dd HH:mm:ss')}
					</Typography>
				)}
			</Box>
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
								0
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
						.filter(([key]) => key !== 'type')
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
								<Typography sx={{ color: 'textDisabled' }}>
									Start: {formatedStartDate}
								</Typography>

								{endTime && (
									<Typography sx={{ color: 'textDisabled' }}>
										End: {formatedEndDate}
									</Typography>
								)}

								<Typography sx={{ color: 'textDisabled' }}>
									Duration: {millisecondsToTimeString(duration)}
								</Typography>
							</>
						)}
			</Box>
		</CardContent>
	);
};
