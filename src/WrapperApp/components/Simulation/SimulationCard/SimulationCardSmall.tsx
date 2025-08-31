import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
	Box,
	Button,
	Card,
	CardHeader,
	Chip,
	Divider,
	IconButton,
	Popover,
	useTheme
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { formatDate } from 'date-fns/format';
import { useRef, useState } from 'react';

import { useStore } from '../../../../services/StoreService';
import { currentJobStatusData, StatusState } from '../../../../types/ResponseTypes';
import { SimulationCardProps } from './SimulationCard';
import { SimulationProgress } from './SimulationCardContent';
import SimulationCardHelpers from './SimulationCardHelpers';

export default function SimulationCardSmall({
	simulationStatus,
	loadResults,
	handleDelete,
	handleCancel,
	handleRefresh,
	showInputFiles,
	...other
}: SimulationCardProps) {
	const theme = useTheme();
	const { yaptideEditor, setSimulationJobIdsSubmittedInSession } = useStore();
	const { statusColor, onClickLoadToEditor } = SimulationCardHelpers({
		loadResults,
		setDisableLoadJson: () => {},
		showInputFiles,
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
	const [showControls, setShowControls] = useState(false);

	return (
		<>
			<Card
				sx={{
					display: 'flex',
					borderStyle: 'solid',
					borderWidth: 1,
					borderColor: theme.palette.divider,
					backgroundColor: theme.palette.grey['900'],
					backgroundImage: 'none' // otherwise "paper overlay" is added, which changes backgroundColor
				}}
				ref={cardRef}
				{...other}
				onClick={() => {
					setShowControls(true);
				}}>
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
						flexGrow: 1
					}}>
					<CardHeader
						title={`${simulationStatus.title}`}
						sx={{ p: 1 }}
						action={
							currentJobStatusData[StatusState.COMPLETED](simulationStatus) && (
								<Tooltip
									title='Hide'
									sx={{
										zIndex: ({ zIndex }) => zIndex.appBar
									}}>
									<IconButton
										aria-label='hide'
										onClick={e => {
											e.stopPropagation();
											setSimulationJobIdsSubmittedInSession(jobIds =>
												jobIds.filter(id => id !== simulationStatus.jobId)
											);
										}}>
										<VisibilityOffIcon />
									</IconButton>
								</Tooltip>
							)
						}
					/>
					<Box sx={{ px: theme.spacing(1) }}>
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
								width: 'fit-content',
								mb: theme.spacing(1)
							}}
						/>
						{simulationStatus.jobState === StatusState.RUNNING && (
							<SimulationProgress
								formatedStartDate={formatDateTime(startDate)}
								duration={duration}
								simulationStatus={simulationStatus}
							/>
						)}
					</Box>
				</Box>
			</Card>
			<Popover
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				open={showControls}
				anchorEl={cardRef.current}
				onClose={() => setShowControls(false)}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						margin: theme.spacing(1),
						gap: theme.spacing(1)
					}}>
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
				</Box>
			</Popover>
		</>
	);
}
