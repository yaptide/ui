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
import { useState } from 'react';

import {
	DatasetDownloadStatus,
	DatasetStatus,
	DownloadManagerStatus
} from '../../../Geant4Worker/Geant4DatasetDownloadManager';
import { useDialog } from '../../../services/DialogService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { StyledExclusiveToggleButtonGroup } from '../../../shared/components/StyledExclusiveToggleButtonGroup';

export enum Geant4DatasetsType {
	LAZY,
	DOWNLOADED
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

export function Geant4DatasetDownloadSelector(props: {
	geant4DatasetType: Geant4DatasetsType;
	setGeant4DatasetType: (type: Geant4DatasetsType) => void;
}) {
	const theme = useTheme();
	const { geant4DatasetType, setGeant4DatasetType } = props;

	const { open: openTheDatasetsInfoDialog } = useDialog('datasetsDetailsInfo');

	return (
		<>
			<StyledExclusiveToggleButtonGroup
				fullWidth
				value={geant4DatasetType}
				onChange={(_, newRunType) =>
					setGeant4DatasetType(newRunType || Geant4DatasetsType.LAZY)
				}>
				<ToggleButton value={Geant4DatasetsType.LAZY}>Lazy files</ToggleButton>
				<ToggleButton value={Geant4DatasetsType.DOWNLOADED}>Downloadable</ToggleButton>
			</StyledExclusiveToggleButtonGroup>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					backgroundColor:
						theme.palette.grey[theme.palette.mode === 'light' ? 'A100' : '900'],
					px: 2,
					py: 1,
					borderRadius: theme.spacing(1),
					mb: 2
				}}>
				{geant4DatasetType === Geant4DatasetsType.DOWNLOADED ? (
					<>
						<Typography
							textTransform='none'
							fontSize={14}
							sx={{ flex: 1, mr: 1 }}>
							DOWNLOADABLE: Speed up the simulation by downloading Geant4 datasets.
						</Typography>
						<Button
							variant='contained'
							onClick={openTheDatasetsInfoDialog}>
							Details
						</Button>
					</>
				) : (
					<Typography
						textTransform='none'
						fontSize={14}
						sx={{ flex: 1, mr: 1 }}>
						LAZY FILES: Longer simulation time because of downloading tousands of files
						on-the-fly. Smaller total download size.
					</Typography>
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
				{geant4DownloadManagerState === DownloadManagerStatus.IDLE && (
					<>
						<Button
							onClick={geant4DatasetDownloadStart}
							variant='contained'>
							Start download
						</Button>
					</>
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
