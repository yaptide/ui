// Full credits to @kmichalik

import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	CircularProgress,
	LinearProgress,
	Typography,
	useTheme
} from '@mui/material';
import { useState } from 'react';

import {
	DatasetDownloadStatus,
	DatasetStatus,
	DownloadManagerStatus
} from '../../../Geant4Worker/Geant4DatasetDownloadManager';
import StyledAccordion from '../../../shared/components/StyledAccordion';

export interface Geant4DatasetsProps {
	geant4DownloadManagerState: DownloadManagerStatus;
	geant4DatasetStates: DatasetStatus[];
	geant4DatasetDownloadStart: () => void;
}

function DatasetCurrentStatus(props: { status: DatasetStatus }) {
	const { status } = props;

	return (
		<Box sx={{ pb: 1 }}>
			<Typography>{status.name}</Typography>
			{status.status === DatasetDownloadStatus.DONE && <CheckIcon />}
			{(status.status === DatasetDownloadStatus.DOWNLOADING ||
				status.status === DatasetDownloadStatus.PROCESSING) && (
				<LinearProgress value={status.done! / status.total!} />
			)}
			{status.status === DatasetDownloadStatus.IDLE && <LinearProgress />}
		</Box>
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
					Datasets download
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
					<Typography>Something went wrong</Typography>
				)}
			</AccordionDetails>
		</StyledAccordion>
	);
}
