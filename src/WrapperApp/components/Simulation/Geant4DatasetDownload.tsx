// Full credits to @kmichalik

import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
	AccordionDetails,
	AccordionSummary,
	Alert,
	Box,
	Button,
	LinearProgress,
	Typography,
	useTheme
} from '@mui/material';
import { palette } from '@mui/system';
import { useState } from 'react';

import {
	DatasetDownloadStatus,
	DatasetStatus,
	DownloadManagerStatus
} from '../../../Geant4Worker/Geant4DatasetDownloadManager';
import { useDialog } from '../../../services/DialogService';
import StyledAccordion from '../../../shared/components/StyledAccordion';

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
				{status.status === DatasetDownloadStatus.IDLE && <LinearProgress color='warning' />}
			</Box>
		</Box>
	);
}

function showDetailsModal() {}

export function Geant4Datasets(props: Geant4DatasetsProps) {
	const theme = useTheme();
	const { geant4DownloadManagerState, geant4DatasetStates, geant4DatasetDownloadStart } = props;
	const [open, setOpen] = useState(true);
	const { open: openTheDatasetsInfoDialog } = useDialog('datasetsDetailsInfo');

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
					Datasets download
				</Typography>
			</AccordionSummary>
			<AccordionDetails
				sx={{
					display: 'flex',
					flexDirection: 'column'
				}}>
				{geant4DownloadManagerState === DownloadManagerStatus.IDLE && (
					<>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								backgroundColor:
									theme.palette.grey[
										theme.palette.mode === 'light' ? 'A100' : '900'
									],
								px: 2,
								py: 1,
								borderRadius: theme.spacing(1),
								mb: 2
							}}>
							<Typography
								textTransform='none'
								fontSize={14}
								sx={{ flex: 1, mr: 1 }}>
								Speed up the simulation by downloading Geant4 datasets.
							</Typography>
							<Button
								variant='contained'
								onClick={openTheDatasetsInfoDialog}>
								Details
							</Button>
						</Box>
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
					<Typography>Something went wrong</Typography>
				)}
			</AccordionDetails>
		</StyledAccordion>
	);
}
