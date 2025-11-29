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
	DownloadManagerStatus
} from '../../../Geant4Worker/Geant4DatasetDownloadManager';
import { useDatasetCacheStatus } from '../../../Geant4Worker/useDatasetCacheStatus';
import { useDialog } from '../../../services/DialogService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { StyledExclusiveToggleButtonGroup } from '../../../shared/components/StyledExclusiveToggleButtonGroup';

export enum Geant4DatasetsType {
	PARTIAL,
	FULL
}

export interface Geant4DatasetsProps {
	geant4DownloadManagerState: DownloadManagerStatus;
	geant4DatasetStates: DatasetStatus[];
	geant4DatasetDownloadStart: () => void;
	geant4DatasetType: Geant4DatasetsType;
	setGeant4DatasetType: (type: Geant4DatasetsType) => void;
}

function DatasetCurrentStatus(props: { status: DatasetStatus }) {
	const { status } = props;

	return (
		<Box sx={{ pb: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Typography sx={{ flex: 1 }}>{status.name}</Typography>
				{status.status === DatasetDownloadStatus.DONE && <CheckIcon color='success' />}
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

/**
 * Component to display cache status with visual indicators
 */
function CacheStatusIndicator({ showDebugInfo = false }: { showDebugInfo?: boolean }) {
	const {
		isLoading,
		allCached,
		cachedCount,
		totalCount,
		downloadSizeNeededMB,
		storageEstimate,
		refresh,
		cacheStatus
	} = useDatasetCacheStatus();

	// Log cache status for debugging
	useEffect(() => {
		console.log('[CacheStatusIndicator] Cache status updated:', {
			isLoading,
			allCached,
			cachedCount,
			totalCount,
			downloadSizeNeededMB,
			datasets: cacheStatus?.datasets
		});
	}, [isLoading, allCached, cachedCount, totalCount, downloadSizeNeededMB, cacheStatus]);

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

			{/* Show individual dataset status */}
			{cacheStatus && cacheStatus.datasets.length > 0 && (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
					{cacheStatus.datasets.map(ds => (
						<Chip
							key={ds.name}
							label={ds.name}
							size='small'
							color={ds.isCached ? 'success' : 'default'}
							variant={ds.isCached ? 'filled' : 'outlined'}
							sx={{ fontSize: '0.65rem', height: 20 }}
						/>
					))}
				</Box>
			)}

			{!allCached && (
				<Typography
					variant='caption'
					color='text.secondary'>
					{cachedCount > 0
						? `~${downloadSizeNeededMB.toFixed(0)} MB remaining to download`
						: `~${downloadSizeNeededMB.toFixed(0)} MB download required (may take several minutes)`}
				</Typography>
			)}

			{showDebugInfo && cacheStatus && (
				<Typography
					variant='caption'
					color='text.secondary'
					sx={{ display: 'block', mt: 1, fontFamily: 'monospace', fontSize: '0.6rem' }}>
					Debug: {cachedCount}/{totalCount} cached, allCached={String(allCached)}
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

export function Geant4Datasets(props: Geant4DatasetsProps) {
	const theme = useTheme();
	const { geant4DownloadManagerState, geant4DatasetStates, geant4DatasetDownloadStart } = props;
	const [open, setOpen] = useState(true);
	const { allCached, refresh } = useDatasetCacheStatus();

	// Refresh cache status when download finishes
	useEffect(() => {
		if (geant4DownloadManagerState === DownloadManagerStatus.FINISHED) {
			console.log('[Geant4Datasets] Download finished, refreshing cache status...');
			// Add a small delay to ensure IndexedDB is updated
			setTimeout(() => refresh(), 1000);
		}
	}, [geant4DownloadManagerState, refresh]);

	const buttonText = allCached ? 'Load from cache' : 'Start download';
	const buttonIcon = allCached ? <CachedIcon sx={{ mr: 1 }} /> : <CloudDownloadIcon sx={{ mr: 1 }} />;

	const showDownloadButton = geant4DownloadManagerState === DownloadManagerStatus.IDLE;
	const showDownloadProgress =
		geant4DownloadManagerState === DownloadManagerStatus.WORKING ||
		geant4DownloadManagerState === DownloadManagerStatus.FINISHED;

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
				{/* Always show cache status indicator */}
				<CacheStatusIndicator showDebugInfo={true} />

				{showDownloadButton && (
					<Button
						onClick={geant4DatasetDownloadStart}
						variant='contained'
						startIcon={buttonIcon}
						color={allCached ? 'success' : 'primary'}>
						{buttonText}
					</Button>
				)}

				{showDownloadProgress &&
					geant4DatasetStates.map(status => (
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
