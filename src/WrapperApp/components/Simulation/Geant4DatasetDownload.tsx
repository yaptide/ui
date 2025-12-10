// Full credits to @kmichalik

import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	LinearProgress,
	ToggleButton,
	Typography,
	useTheme
} from '@mui/material';
import { useEffect,useState } from 'react';

import {
	DatasetDownloadStatus,
	DatasetStatus,
	DownloadManagerStatus
} from '../../../Geant4Worker/Geant4DatasetDownloadManager';
import { useDialog } from '../../../services/DialogService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { StyledExclusiveToggleButtonGroup } from '../../../shared/components/StyledExclusiveToggleButtonGroup';

export enum Geant4DatasetsType {
	PARTIAL,
	FULL
}

function formatTime(seconds: number): string {
	if (seconds < 1) {
		return '<1s';
	}

	if (seconds < 60) {
		return `${Math.ceil(seconds)}s`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.ceil(seconds % 60);

	return `${minutes}m ${remainingSeconds}s`;
}

export interface Geant4DatasetsProps {
	geant4DownloadManagerState: DownloadManagerStatus;
	geant4DatasetStates: DatasetStatus[];
	geant4DatasetDownloadStart: () => void;
	geant4DatasetType: Geant4DatasetsType;
	setGeant4DatasetType: (type: Geant4DatasetsType) => void;
}

interface SpeedHistory {
	lastDone: number;
	lastTime: number;
	currentSpeed: number;
}

const SMOOTHING = 0.1;

function DatasetCurrentStatus(props: { status: DatasetStatus }) {
	const { status } = props;

	const [speedHistory, setSpeedHistory] = useState<SpeedHistory>({
		lastDone: status.done ?? 0,
		lastTime: Date.now(),
		currentSpeed: 0
	});

	useEffect(() => {
		const currentDone = status.done ?? 0;
		const currentTime = Date.now();

		if (status.status === DatasetDownloadStatus.DOWNLOADING) {
			setSpeedHistory(prev => {
				const timeDelta = (currentTime - prev.lastTime) / 1000;
				const bytesDelta = currentDone - prev.lastDone;

				if (bytesDelta > 0 && timeDelta > 0) {
					const instSpeed = bytesDelta / timeDelta;

					const newSpeed =
						prev.currentSpeed === 0
							? instSpeed
							: prev.currentSpeed * (1 - SMOOTHING) + instSpeed * SMOOTHING;

					return {
						lastDone: currentDone,
						lastTime: currentTime,
						currentSpeed: newSpeed
					};
				}

				return {
					...prev,
					lastTime: currentTime
				};
			});
		}

		if (
			status.status === DatasetDownloadStatus.DONE ||
			status.status === DatasetDownloadStatus.IDLE
		) {
			setSpeedHistory({
				lastDone: status.done ?? 0,
				lastTime: Date.now(),
				currentSpeed: 0
			});
		}
	}, [status.done, status.status]);

	const remainingBytes = (status.total ?? 0) - (status.done ?? 0);
	let estimatedTimeRemaining = '';

	if (
		status.status === DatasetDownloadStatus.DOWNLOADING &&
		speedHistory.currentSpeed > 0 &&
		remainingBytes > 0
	) {
		const remainingSeconds = remainingBytes / speedHistory.currentSpeed;
		estimatedTimeRemaining = ` (${formatTime(remainingSeconds)})`;
	}

	return (
		<Box sx={{ pb: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Typography sx={{ flex: 1 }}>{status.name}</Typography>

				{status.status === DatasetDownloadStatus.DONE && <CheckIcon color='success' />}
				{status.status === DatasetDownloadStatus.DOWNLOADING && (
					<Typography
						fontSize={12}
						color='text.secondary'>
						{estimatedTimeRemaining}
					</Typography>
				)}
			</Box>

			<Box sx={{ mt: 1 }}>
				{status.status === DatasetDownloadStatus.DOWNLOADING && (
					<LinearProgress
						variant='determinate'
						value={status.total ? ((status.done ?? 0) / status.total) * 100 : 0}
						color='primary'
					/>
				)}
				{status.status === DatasetDownloadStatus.PROCESSING && (
					<LinearProgress
						variant='indeterminate'
						value={status.total ? ((status.done ?? 0) / status.total) * 100 : 0}
						color='warning'
					/>
				)}
				{status.status === DatasetDownloadStatus.IDLE && (
					<LinearProgress
						color='info'
						variant='indeterminate'
					/>
				)}
			</Box>
		</Box>
	);
}

export function Geant4DatasetDownloadSelector(props: {
	geant4DatasetType: Geant4DatasetsType;
	setGeant4DatasetType: (type: Geant4DatasetsType) => void;
}) {
	const { geant4DatasetType, setGeant4DatasetType } = props;

	const { open: openTheFullDatasetsInfoDialog } = useDialog('datasetsFullDetailsInfo');
	const { open: openThePartialDatasetsInfoDialog } = useDialog('datasetsPartialDetailsInfo');

	return (
		<>
			<StyledExclusiveToggleButtonGroup
				fullWidth
				value={geant4DatasetType}
				onChange={(_, newRunType) =>
					setGeant4DatasetType(newRunType || Geant4DatasetsType.PARTIAL)
				}
				aria-label='Datasets'>
				<ToggleButton value={Geant4DatasetsType.PARTIAL}>Partial Datasets</ToggleButton>
				<ToggleButton value={Geant4DatasetsType.FULL}>Full Datasets</ToggleButton>
			</StyledExclusiveToggleButtonGroup>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 2
				}}>
				{geant4DatasetType === Geant4DatasetsType.FULL ? (
					<>
						<Typography
							textTransform='none'
							fontSize={11}
							sx={{ flex: 1, mr: 1 }}>
							<b>FULL</b>: Speed up the simulation by downloading Geant4 datasets.
						</Typography>
						<Button
							variant='contained'
							onClick={openTheFullDatasetsInfoDialog}>
							Details
						</Button>
					</>
				) : (
					<>
						<Typography
							textTransform='none'
							fontSize={11}
							sx={{ flex: 1, mr: 1 }}>
							<b>PARTIAL</b>: Longer simulation time because of downloading thousands
							of files on-the-fly. Smaller total download size.
						</Typography>
						<Button
							variant='contained'
							onClick={openThePartialDatasetsInfoDialog}>
							Details
						</Button>
					</>
				)}
			</Box>
		</>
	);
}

export function Geant4Datasets(props: Geant4DatasetsProps) {
	const theme = useTheme();
	const { geant4DownloadManagerState, geant4DatasetStates, geant4DatasetDownloadStart } = props;
	const [open, setOpen] = useState(true);

	return (
		<StyledAccordion
			expanded={open}
			sx={{
				margin: `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)}`
			}}>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				onClick={e => {
					e.stopPropagation();
					setOpen(!open);
				}}>
				<Typography
					textTransform='none'
					fontSize={16}>
					Dataset Download{' '}
					{geant4DownloadManagerState === DownloadManagerStatus.FINISHED ? '(done)' : ''}
				</Typography>
			</AccordionSummary>
			<AccordionDetails
				sx={{
					display: 'flex',
					flexDirection: 'column'
				}}>
				{geant4DownloadManagerState === DownloadManagerStatus.IDLE && (
					<Button
						onClick={geant4DatasetDownloadStart}
						variant='contained'>
						Start download
					</Button>
				)}
				{geant4DatasetStates.map(status => (
					<DatasetCurrentStatus
						status={status}
						key={status.name}
					/>
				))}
				{geant4DownloadManagerState === DownloadManagerStatus.ERROR && (
					<Typography>
						Failed to download datasets. Please check your connection and try again.
					</Typography>
				)}
			</AccordionDetails>
		</StyledAccordion>
	);
}
