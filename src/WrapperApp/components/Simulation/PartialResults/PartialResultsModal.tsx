import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';

import Box from '../../../../ThreeEditor/components/Sidebar/SidebarTreeList/svg/Box';
import { JobPartialResults, RequestGetJobPartialResults } from '../../../../types/RequestTypes';
import PartialResultsContent from './PartialResultsContent';

interface PartialResultsModalProps {
	jobId?: string;
	getJobPartialResults?: (
		...args: RequestGetJobPartialResults
	) => Promise<JobPartialResults | undefined>;
	open: boolean;
	onClose: () => void;
}

export default function PartialResultsModal({
	jobId,
	getJobPartialResults,
	open,
	onClose
}: PartialResultsModalProps) {
	const theme = useTheme();

	return (
		<Modal
			aria-labelledby='transition-modal-title'
			aria-describedby='transition-modal-description'
			open={open}
			onClose={onClose}
			closeAfterTransition>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
				/>
			</Box>
		</Modal>
	);
}
