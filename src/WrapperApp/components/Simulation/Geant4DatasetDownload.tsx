// Full credits to @kmichalik

import CachedIcon from '@mui/icons-material/Cached';
import CheckIcon from '@mui/icons-material/Check';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StorageIcon from '@mui/icons-material/Storage';
import {
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Chip,
	CircularProgress,
	LinearProgress,
	ToggleButton,
	Tooltip,
	Typography,
	useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
	DatasetDownloadStatus,
	DatasetStatus,
	DownloadManagerStatus,
	useDatasetManager
} from '../../../Geant4Worker/Geant4DatasetManager';
import { useDialog } from '../../../services/DialogService';
import { useSharedDatasetManager } from '../../../services/Geant4DatasetContextProvider';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { StyledExclusiveToggleButtonGroup } from '../../../shared/components/StyledExclusiveToggleButtonGroup';

export enum Geant4DatasetsType {
	PARTIAL,
	FULL
}

function DatasetCurrentStatus(props: { status: DatasetStatus }) {
	const { status } = props;

	let icon = null;

	if (status.status === DatasetDownloadStatus.DONE) {
		icon = <CheckIcon color='success' />;
	} else if (status.isCached) {
		icon = <StorageIcon color='warning' />;
	} else {
		icon = <CloudDownloadIcon color='error' />;
	}

	return (
		<Box sx={{ pb: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Typography sx={{ flex: 1 }}>{status.name}</Typography>
				{icon}
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
						color='warning'
					/>
				)}
			</Box>
		</Box>
	);
}

function CacheStatusIndicator({ showDebugInfo = false }: { showDebugInfo?: boolean }) {
	const { isLoading, cachedCount, totalCount, downloadSizeNeededMB, storageEstimate, refresh } =
		useDatasetManager();

	const allCached = cachedCount === totalCount;

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
				<CircularProgress size={16} />
				<Typography
					variant='body2'
					color='text.secondary'>
					Checking cache status...
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ mb: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
				{allCached ? (
					<Tooltip title='All datasets are cached in your browser. Loading will be quick!'>
						<Chip
							icon={<CachedIcon />}
							label='Cached'
							color='success'
							size='small'
							variant='filled'
						/>
					</Tooltip>
				) : cachedCount > 0 ? (
					<Tooltip
						title={`${cachedCount} of ${totalCount} datasets cached. ~${downloadSizeNeededMB.toFixed(0)} MB needs to be downloaded.`}>
						<Chip
							icon={<CloudDownloadIcon />}
							label={`Partially cached (${cachedCount}/${totalCount})`}
							color='warning'
							size='small'
							variant='filled'
						/>
					</Tooltip>
				) : (
					<Tooltip
						title={`No datasets cached. ~${downloadSizeNeededMB.toFixed(0)} MB will be downloaded from S3.`}>
						<Chip
							icon={<CloudDownloadIcon />}
							label='Not cached'
							color='error'
							size='small'
							variant='filled'
						/>
					</Tooltip>
				)}

				{storageEstimate && (
					<Tooltip
						title={`Browser storage: ${storageEstimate.usedMB.toFixed(0)} MB used of ${storageEstimate.quotaMB.toFixed(0)} MB (${storageEstimate.percentUsed.toFixed(1)}%)`}>
						<Chip
							icon={<StorageIcon />}
							label={`${storageEstimate.usedMB.toFixed(0)} MB used`}
							size='small'
							variant='outlined'
						/>
					</Tooltip>
				)}

				<Tooltip title='Refresh cache status'>
					<Chip
						icon={<CachedIcon />}
						label='Refresh'
						size='small'
						variant='outlined'
						onClick={refresh}
						sx={{ cursor: 'pointer' }}
					/>
				</Tooltip>
			</Box>

			{!allCached && (
				<Typography
					variant='caption'
					color='text.secondary'>
					{cachedCount > 0
						? `~${downloadSizeNeededMB.toFixed(0)} MB remaining to download`
						: `~${downloadSizeNeededMB.toFixed(0)} MB download required (may take several minutes)`}
				</Typography>
			)}
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

export function Geant4Datasets() {
	const theme = useTheme();
	const [open, setOpen] = useState(true);
	const {
		managerState: geant4DownloadManagerState,
		datasetStatus,
		startDownload: geant4DatasetDownloadStart,
		cachedCount,
		totalCount,
		refresh
	} = useSharedDatasetManager();

	const allCached = cachedCount === totalCount;

	console.log(datasetStatus);

	// Refresh cache status when download finishes
	useEffect(() => {
		if (geant4DownloadManagerState === DownloadManagerStatus.FINISHED) {
			console.log('[Geant4Datasets] Download finished, refreshing cache status...');
			// Add a small delay to ensure IndexedDB is updated
			setTimeout(() => refresh(), 1000);
			setOpen(false);
		}
	}, [geant4DownloadManagerState, refresh]);

	const buttonText = allCached ? 'Load from cache' : 'Start download';
	const buttonIcon = allCached ? (
		<CachedIcon sx={{ mr: 1 }} />
	) : (
		<CloudDownloadIcon sx={{ mr: 1 }} />
	);

	const showDownloadButton = geant4DownloadManagerState === DownloadManagerStatus.IDLE;
	const showDownloadProgress =
		geant4DownloadManagerState === DownloadManagerStatus.WORKING ||
		geant4DownloadManagerState === DownloadManagerStatus.FINISHED ||
		cachedCount > 0;

	return (
		<StyledAccordion
			expanded={open}
			sx={{
				margin: `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)}`
			}}>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				onClick={() => setOpen(!open)}>
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
				<CacheStatusIndicator showDebugInfo={false} />

				{showDownloadProgress &&
					Object.values(datasetStatus).map(status => (
						<DatasetCurrentStatus
							status={status}
							key={status.name}
						/>
					))}

				{showDownloadButton && (
					<Button
						onClick={geant4DatasetDownloadStart}
						variant='contained'
						startIcon={buttonIcon}
						color={allCached ? 'success' : 'primary'}>
						{buttonText}
					</Button>
				)}

				{geant4DownloadManagerState === DownloadManagerStatus.ERROR && (
					<Typography>
						Failed to download datasets. Please check your connection and try again.
					</Typography>
				)}
			</AccordionDetails>
		</StyledAccordion>
	);
}
