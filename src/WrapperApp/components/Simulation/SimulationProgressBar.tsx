import { Box, LinearProgress, Tooltip } from '@mui/material';
import { useMemo } from 'react';
import Countdown from 'react-countdown';

import { StatusState, TaskStatusData, TaskTime } from '../../../types/ResponseTypes';
import { isJobDataValid } from '../../../util/jobDataValidation';
import { millisecondsToTimeString } from '../../../util/time';

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

export function SimulationProgressBar({ status }: Readonly<SimulationProgressBarProps>) {
	const progressValue = useMemo(() => {
		if (!isJobDataValid(status)) {
			return 0;
		}

		return status.simulatedPrimaries! / status.requestedPrimaries!;
	}, [status]);

	const startDate = status.startTime ? new Date(status.startTime) : undefined;
	const endDate = status.endTime ? new Date(status.endTime) : undefined;

	const duration = startDate && endDate ? endDate.getTime() - startDate.getTime() : 0;

	return (
		<Tooltip
			followCursor={true}
			placement='left'
			title={
				<>
					{status.estimatedTime ? (
						<>
							Estimated time remaining:{' '}
							<Countdown date={getDateFromEstimation(status.estimatedTime)} />
						</>
					) : (
						`Time elapsed: ${millisecondsToTimeString(duration)}`
					)}
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
					sx={{
						height: 'calc(100% - 1px)',
						width: 'calc(100% - 1px)',
						backgroundImage:
							status.taskState === StatusState.RUNNING
								? 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)'
								: undefined,
						backgroundSize:
							status.taskState === StatusState.RUNNING ? '20px 20px' : undefined,
						backgroundRepeat: 'repeat',
						animation:
							status.taskState === StatusState.RUNNING
								? 'moveDots 1s linear infinite'
								: undefined
					}}
					color={statusToColor(status.taskState ?? StatusState.PENDING)}
					variant='determinate'
					value={progressValue * 100}
					valueBuffer={1}
				/>
			</Box>
		</Tooltip>
	);
}
