import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, CardHeader, IconButton, Tooltip } from '@mui/material';

import {
	currentJobStatusData,
	JobUnknownStatus,
	SimulationInfo,
	StatusState
} from '../../../../types/ResponseTypes';
import { millisecondsToTimeString } from '../../../../util/time';

interface SimulationCardHeaderProps {
	handleDelete?: (jobId: string) => void;
	handleRefresh?: (jobId: string) => void;
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
}

export const SimulationCardHeader = ({
	handleDelete,
	handleRefresh,
	simulationStatus
}: SimulationCardHeaderProps) => {
	return (
		<CardHeader
			title={`${simulationStatus.title}`}
			sx={{ p: 1 }}
			action={
				handleDelete &&
				(currentJobStatusData[StatusState.COMPLETED](simulationStatus) ||
					currentJobStatusData[StatusState.FAILED](simulationStatus) ||
					currentJobStatusData[StatusState.CANCELED](simulationStatus)) ? (
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
	);
};
