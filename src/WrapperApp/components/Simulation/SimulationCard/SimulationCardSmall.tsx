import { Box, Button, ButtonGroup, Card, CardHeader, Chip, Divider, useTheme } from '@mui/material';
import { formatDate } from 'date-fns/format';
import { useRef } from 'react';

import { useStore } from '../../../../services/StoreService';
import { StatusState } from '../../../../types/ResponseTypes';
import { SimulationCardProps } from './SimulationCard';
import { SimulationProgress } from './SimulationCardContent';
import SimulationCardHelpers from './SimulationCardHelpers';

export default function SimulationCardSmall({
	simulationStatus,
	loadResults,
	...other
}: SimulationCardProps) {
	const theme = useTheme();
	const { yaptideEditor } = useStore();
	const { statusColor, onClickLoadToEditor } = SimulationCardHelpers({
		loadResults,
		setDisableLoadJson: () => {},
		showInputFiles: () => {},
		simulationStatus,
		yaptideEditor
	});

	const { startTime, endTime } = simulationStatus;

	const startDate = new Date(startTime);
	const endDate = endTime ? new Date(endTime) : new Date();
	const duration = endDate ? endDate.valueOf() - startDate.valueOf() : 0;

	const formatDateTime = (date: Date) => formatDate(date, 'yyyy-MM-dd HH:mm:ss');

	const highlightColor = statusColor(
		simulationStatus.localData ? StatusState.LOCAL : simulationStatus.jobState
	);

	const cardRef = useRef(null);

	return (
		<>
			<Card
				sx={{
					display: 'flex',
					borderStyle: 'solid',
					borderWidth: 1,
					borderColor: theme.palette.divider,
					backgroundColor:
						theme.palette.mode === 'dark'
							? theme.palette.grey['900']
							: theme.palette.grey['100'],
					backgroundImage: 'none' // otherwise "paper overlay" is added, which changes backgroundColor
				}}
				ref={cardRef}
				{...other}>
				<Divider
					orientation='vertical'
					sx={{
						height: 'auto',
						borderLeftWidth: 5,
						borderColor: highlightColor
					}}
				/>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						flexGrow: 1,
						p: theme.spacing(1),
						gap: theme.spacing(1)
					}}>
					<CardHeader
						title={`${simulationStatus.title}`}
						sx={{ p: 0 }}
					/>
					<Chip
						variant='filled'
						size='small'
						label={
							simulationStatus.localData
								? StatusState.LOCAL
								: simulationStatus.jobState
						}
						sx={{
							backgroundColor: highlightColor,
							color: 'white',
							width: 'fit-content'
						}}
					/>
					{simulationStatus.jobState === StatusState.RUNNING && (
						<SimulationProgress
							formatedStartDate={formatDateTime(startDate)}
							duration={duration}
							simulationStatus={simulationStatus}
						/>
					)}
					<ButtonGroup fullWidth>
						<Button
							variant='outlined'
							color='secondary'
							disabled={simulationStatus.jobState !== StatusState.COMPLETED}
							onClick={loadResults && (() => loadResults(simulationStatus.jobId))}>
							Load Results
						</Button>
						<Button
							variant='outlined'
							color='secondary'
							onClick={() => onClickLoadToEditor(simulationStatus)}>
							Load to Editor
						</Button>
					</ButtonGroup>
				</Box>
			</Card>
		</>
	);
}
