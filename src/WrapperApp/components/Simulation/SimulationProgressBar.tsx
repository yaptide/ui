import { Box, LinearProgress, Divider, Tooltip } from '@mui/material';
import { TaskStatusData, TaskTime, StatusState } from '../../../services/ResponseTypes';
import { useRef, useCallback, useEffect } from 'react';
import Countdown from 'react-countdown';

const getDateFromEstimation = (estimated?: TaskTime) => {
	if (!estimated) return undefined;
	const { hours, minutes, seconds } = estimated;
	const date =
		Date.now() +
		(parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
	return date;
};

type SimulationProgressBarProps = {
	status: TaskStatusData;
};
const statusToColor = (status: StatusState) => {
	switch (status) {
		case StatusState.FAILED:
			return 'error';
		case StatusState.COMPLETED:
			return 'success';
		default:
			return 'secondary';
	}
};

export function SimulationProgressBar({ status }: SimulationProgressBarProps) {
	const updateProgress = useCallback(() => {
		const progress = (status?.simulatedPrimaries ?? 0) / (status?.requestedPrimaries ?? 1);
		return progress;
	}, [status]);
	const progress = useRef<number>(updateProgress());
	useEffect(() => {
		progress.current = updateProgress();
	}, [updateProgress]);
	return (
		<Tooltip
			followCursor={true}
			placement='left'
			title={
				<>
					{status.estimatedTime ? 'Estimated time remaining ' : 'Time elapsed '}
					<Countdown
						date={getDateFromEstimation(status.estimatedTime ?? status.runTime)}
					/>
				</>
			}>
			<Box
				sx={{
					'width': '100%',
					'minHeight': 12,
					'height': '100%',
					'transition': 'min-height 0.5s ease-in-out',
					'&:hover': {
						minHeight: 18
					}
				}}>
				<LinearProgress
					sx={{ height: 'calc(100% - 1px)', width: 'calc(100% - 1px)' }}
					color={statusToColor(status.taskState ?? StatusState.PENDING)}
					variant='determinate'
					value={progress.current * 100}
					valueBuffer={1}
				/>
			</Box>
		</Tooltip>
	);
}
