// Full credits to @kmichalik

import CachedIcon from '@mui/icons-material/Cached';
import CheckIcon from '@mui/icons-material/Check';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaylistRemove from '@mui/icons-material/PlaylistRemove';
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
import { JSX, use, useEffect, useState } from 'react';

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

	const datasetStatusIcon: Map<DatasetDownloadStatus, JSX.Element> = new Map([
		[DatasetDownloadStatus.IDLE, <CachedIcon color='disabled' />],
		[DatasetDownloadStatus.DOWNLOADING, <CloudDownloadIcon color='primary' />],
		[DatasetDownloadStatus.PROCESSING, <CachedIcon color='warning' />],
		[DatasetDownloadStatus.CACHED, <StorageIcon color='success' />],
		[DatasetDownloadStatus.DONE, <CheckIcon color='primary' />]
	]);

	const datasetProgressBar: Map<DatasetDownloadStatus, JSX.Element> = new Map([
		[
			DatasetDownloadStatus.DOWNLOADING,
			<LinearProgress
				variant='determinate'
				value={status.total ? ((status.done ?? 0) / status.total) * 100 : 0}
				color='primary'
			/>
		],
		[
			DatasetDownloadStatus.PROCESSING,
			<LinearProgress
				variant='indeterminate'
				color='warning'
			/>
		]
	]);

	return (
		<Box sx={{ pb: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Typography sx={{ flex: 1 }}>{status.name}</Typography>
				{datasetStatusIcon.get(status.status)}
			</Box>

			<Box sx={{ mt: 1 }}>{datasetProgressBar.get(status.status)}</Box>
		</Box>
	);
}

enum DatasetChipType {
	CACHED,
	PARTIALLY_CACHED,
	NOT_CACHED
}

type DatasetCachedChipInfo = {
	title: string;
	chip: {
		icon: JSX.Element;
		label: string;
		color: 'success' | 'warning' | 'error';
	};
};

type DatasetCachedChipProps = {
	cachedCount: number;
	totalCount: number;
	downloadSizeNeededMB: number;
	type: DatasetChipType;
};

function DatasetCachedChip(props: DatasetCachedChipProps) {
	const { cachedCount, totalCount, downloadSizeNeededMB, type } = props;

	const chipPropsPerStatus: Record<DatasetChipType, DatasetCachedChipInfo> = {
		[DatasetChipType.CACHED]: {
			title: 'All datasets are cached in your browser. Loading will be quick!',
			chip: {
				icon: <CachedIcon />,
				label: 'Cached',
				color: 'success'
			}
		},
		[DatasetChipType.PARTIALLY_CACHED]: {
			title: `${cachedCount} of ${totalCount} datasets cached. ~${downloadSizeNeededMB.toFixed(0)} MB needs to be downloaded.`,
			chip: {
				icon: <CloudDownloadIcon />,
				label: `Partially cached (${cachedCount}/${totalCount})`,
				color: 'warning'
			}
		},
		[DatasetChipType.NOT_CACHED]: {
			title: `No datasets cached. ~${downloadSizeNeededMB.toFixed(0)} MB will be downloaded from S3.`,
			chip: {
				icon: <CloudDownloadIcon />,
				label: 'Not cached',
				color: 'error'
			}
		}
	};

	return (
		<Tooltip title={chipPropsPerStatus[type].title}>
			<Chip
				icon={chipPropsPerStatus[type].chip.icon}
				label={chipPropsPerStatus[type].chip.label}
				size='small'
				color={chipPropsPerStatus[type].chip.color}
				sx={{ px: 1 }}
			/>
		</Tooltip>
	);
}

function CacheStatusIndicator() {
	const {
		isLoading,
		cachedCount,
		totalCount,
		downloadSizeNeededMB,
		storageEstimate,
		refresh,
		clearCache
	} = useDatasetManager();
	const [allCached, setAllCached] = useState(false);

	useEffect(() => {
		setAllCached(cachedCount === totalCount);
	}, [cachedCount, totalCount]);

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
				<DatasetCachedChip
					cachedCount={cachedCount}
					totalCount={totalCount}
					downloadSizeNeededMB={downloadSizeNeededMB}
					type={
						allCached
							? DatasetChipType.CACHED
							: cachedCount > 0
								? DatasetChipType.PARTIALLY_CACHED
								: DatasetChipType.NOT_CACHED
					}
				/>

				{storageEstimate && (
					<Tooltip
						title={`Browser storage: ${storageEstimate.usedMB.toFixed(0)} MB used of ${storageEstimate.quotaMB.toFixed(0)} MB (${storageEstimate.percentUsed.toFixed(1)}%)`}>
						<Chip
							icon={<StorageIcon />}
							label={`${storageEstimate.usedMB.toFixed(0)} MB used`}
							size='small'
							variant='outlined'
							sx={{ px: 1 }}
						/>
					</Tooltip>
				)}

				{cachedCount > 0 && (
					<Tooltip title='Clear cached datasets'>
						<Chip
							icon={<PlaylistRemove />}
							label='Clear'
							size='small'
							variant='outlined'
							onClick={clearCache}
							sx={{ cursor: 'pointer', px: 1 }}
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
						sx={{ cursor: 'pointer', px: 1 }}
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

	const [allCached, setAllCached] = useState(false);

	useEffect(() => {
		setAllCached(cachedCount === totalCount);
	}, [cachedCount, totalCount]);

	// Refresh cache status when download finishes
	useEffect(() => {
		if (geant4DownloadManagerState === DownloadManagerStatus.FINISHED) {
			// Add a small delay to ensure IndexedDB is updated
			setTimeout(() => {
				refresh();
				setOpen(false);
			}, 1000);
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
				<CacheStatusIndicator />

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
