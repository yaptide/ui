import CachedIcon from '@mui/icons-material/Cached';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import StorageIcon from '@mui/icons-material/Storage';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography
} from '@mui/material';

import { useDatasetCacheStatus } from '../../../../Geant4Worker/useDatasetCacheStatus';
import {
	ConcreteDialogProps,
	CustomDialog
} from '../../../../ThreeEditor/components/Dialog/CustomDialog';

const datasetSummaries = [
	{
		name: 'G4EMLOW8.6.1',
		description:
			'Contains low-energy electromagnetic data used for accurate simulation of processes such as ionization, bremsstrahlung, and fluorescence for electrons, photons, and ions below 1 GeV.'
	},
	{
		name: 'G4ENSDFSTATE3.0',
		description:
			'Provides evaluated nuclear structure data (energy levels, half-lives, decay modes) derived from the ENSDF library for use in radioactive decay and photon evaporation simulations.'
	},
	{
		name: 'G4NDL4.7.1',
		description:
			'Neutron cross-section library for high-precision (HP) models, including data for elastic, inelastic, fission, and capture processes up to 20 MeV.'
	},
	{
		name: 'G4PARTICLEXS4.1',
		description:
			'Contains proton-, neutron-, pion-, and light-ion interaction cross sections used by the particle-level cross-section models for hadronic physics.'
	},
	{
		name: 'G4SAIDDATA2.0',
		description:
			'Data evaluated from the SAID database for proton, neutron, pion inelastic, elastic, and charge exchange cross sections of nucleons below 3 GeV'
	},
	{
		name: 'G4PhotonEvaporation6.1',
		description:
			'Data for photon emission and internal conversion following nuclear de-excitation, used by the photon evaporation model in radioactive decay and photo-nuclear processes.'
	}
];

/**
 * Component to display current cache status in the dialog
 */
function CacheStatusSection() {
	const {
		isLoading,
		allCached,
		cachedCount,
		totalCount,
		downloadSizeNeededMB,
		storageEstimate,
		cacheStatus
	} = useDatasetCacheStatus();

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
				<CircularProgress size={20} />
				<Typography color='text.secondary'>Checking cache status...</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ mt: 2 }}>
			<Typography
				variant='subtitle2'
				sx={{ mb: 1 }}>
				Current Cache Status:
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
				{allCached ? (
					<Chip
						icon={<CachedIcon />}
						label='All datasets cached'
						color='success'
						size='small'
					/>
				) : cachedCount > 0 ? (
					<Chip
						icon={<CloudDownloadIcon />}
						label={`${cachedCount}/${totalCount} datasets cached`}
						color='warning'
						size='small'
					/>
				) : (
					<Chip
						icon={<CloudDownloadIcon />}
						label='No datasets cached'
						color='error'
						size='small'
					/>
				)}

				{storageEstimate && (
					<Tooltip
						title={`${storageEstimate.percentUsed.toFixed(1)}% of browser storage quota used`}>
						<Chip
							icon={<StorageIcon />}
							label={`${storageEstimate.usedMB.toFixed(0)} MB / ${(storageEstimate.quotaMB / 1024).toFixed(1)} GB`}
							size='small'
							variant='outlined'
						/>
					</Tooltip>
				)}
			</Box>

			{!allCached && (
				<Typography
					variant='body2'
					color='text.secondary'>
					{cachedCount > 0
						? `~${downloadSizeNeededMB.toFixed(0)} MB remaining to download`
						: `~${downloadSizeNeededMB.toFixed(0)} MB total download required`}
				</Typography>
			)}

			{cacheStatus && cacheStatus.datasets.length > 0 && (
				<Box sx={{ mt: 1 }}>
					{cacheStatus.datasets.map(ds => (
						<Chip
							key={ds.name}
							label={ds.name}
							size='small'
							color={ds.isCached ? 'success' : 'default'}
							variant={ds.isCached ? 'filled' : 'outlined'}
							sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
						/>
					))}
				</Box>
			)}
		</Box>
	);
}

export function DatasetsFullInfoDialog({ onClose }: ConcreteDialogProps) {
	return (
		<CustomDialog
			onClose={onClose}
			alert={true}
			title='FULL Geant4 Datasets Info'
			contentText={`
                Downloading the FULL Geant4 datasets can significantly speed up simulations by providing local access to essential data files. 
                Data files will be stored in your browser's IndexedDB storage.
                Below is a summary of the datasets available for download:`}
			body={
				<>
					<CacheStatusSection />
					<Alert
						severity='info'
						sx={{ mt: 2 }}>
						The cache status indicator shows which datasets are stored in your browser.
						When all datasets are cached, loading will be nearly instant. Otherwise,
						datasets will be downloaded from S3 storage.
					</Alert>
					<Alert
						severity='warning'
						sx={{ mt: 2 }}>
						Total size of downloaded datasets is about 2GB. Each time you clear your
						browser data, you will need to re-download these datasets for optimal
						simulation performance.
					</Alert>
					<TableContainer
						component={Paper}
						sx={{ mt: 2 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Description</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{datasetSummaries.map(ds => (
									<TableRow
										key={ds.name}
										sx={{
											'&:nth-of-type(odd)': {
												backgroundColor: 'action.hover'
											},
											'&:last-child td, &:last-child th': { border: 0 },
											'verticalAlign': 'top'
										}}>
										<TableCell>{ds.name}</TableCell>
										<TableCell>{ds.description}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</>
			}>
			<Button
				onClick={() => {
					onClose();
				}}
				color='secondary'
				variant='contained'
				autoFocus>
				Close
			</Button>
		</CustomDialog>
	);
}
