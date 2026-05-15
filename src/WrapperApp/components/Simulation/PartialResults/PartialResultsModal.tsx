import { Box, DialogContent, Fade, Typography, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';

import { JobPartialResults, RequestGetJobPartialResults } from '../../../../types/RequestTypes';
import { JobUnknownStatus, SimulationInfo } from '../../../../types/ResponseTypes';
import PartialResultsContent from './PartialResultsContent';

interface PartialResultsModalProps {
	open: boolean;
	jobId?: string;
	jobStatus?: Omit<JobUnknownStatus & SimulationInfo, never>;
	getJobPartialResults?: (
		...args: RequestGetJobPartialResults
	) => Promise<JobPartialResults | undefined>;
	onClose: () => void;
}

export default function PartialResultsModal({
	jobId,
	getJobPartialResults,
	jobStatus,
	open,
	onClose
}: PartialResultsModalProps) {
	const theme = useTheme();

	return (
		<Modal
			open={open}
			onClose={onClose}>
			<Fade in={open}>
				<Box
					sx={{
						height: '80vh',
						width: '60vw',
						overflow: 'hidden',
						backgroundColor: theme.palette.background.paper,
						borderStyle: 'solid',
						borderColor: theme.palette.divider,
						borderWidth: 1,
						borderRadius: theme.spacing(1),
						my: '10vh',
						mx: '20vw',
						boxShadow: theme.shadows[10]
					}}>
					<Box
						sx={{
							height: '100%',
							width: '100%',
							padding: theme.spacing(1),
							overflowY: 'auto',
							boxSizing: 'border-box',
							display: 'flex',
							flexDirection: 'column',
							gap: theme.spacing(1)
						}}>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}>
							<Typography
								variant='h5'
								sx={{ margin: 0, ml: theme.spacing(1) }}>
								Partial Results for {jobStatus?.title}
							</Typography>
							{onClose && (
								<Button
									color='info'
									onClick={() => onClose()}>
									Close
								</Button>
							)}
						</Box>
						<Divider />

						<PartialResultsContent
							getJobPartialResults={getJobPartialResults}
							jobId={jobId}
							jobStatus={jobStatus}
						/>
					</Box>
				</Box>
			</Fade>
		</Modal>
	);
}
