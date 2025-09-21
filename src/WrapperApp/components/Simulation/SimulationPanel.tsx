import { Box, Fade, Modal, Typography, useTheme } from '@mui/material';
import { useState } from 'react';

import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import { SimulationsGrid } from './SimulationsGrid/SimulationsGrid';

interface SimulationPanelProps {
	goToResults?: () => void;
	goToRun: (inputFiles?: SimulationInputFiles) => void;
	forwardedInputFiles?: SimulationInputFiles;
}

export default function SimulationPanel({
	goToResults,
	goToRun,
	forwardedInputFiles
}: SimulationPanelProps) {
	const theme = useTheme();
	const auth = useAuth();
	const { yaptideEditor } = useStore();
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);
	const [inputFiles, setInputFiles] = useState(forwardedInputFiles);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100%',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column'
			}}>
			<Modal
				aria-labelledby='transition-modal-title'
				aria-describedby='transition-modal-description'
				open={showInputFilesEditor}
				onClose={() => setShowInputFilesEditor(false)}
				closeAfterTransition>
				<Fade in={showInputFilesEditor}>
					<Box
						sx={{
							height: '90vh',
							width: '80vw',
							overflow: 'hidden',
							backgroundColor: theme.palette.background.paper,
							borderStyle: 'solid',
							borderColor: theme.palette.divider,
							borderWidth: 1,
							borderRadius: theme.spacing(1),
							my: '5vh',
							mx: '10vw',
							boxShadow: theme.shadows[10]
						}}>
						<Box
							sx={{
								height: '100%',
								width: '100%',
								padding: theme.spacing(1),
								overflowY: 'scroll',
								boxSizing: 'border-box'
							}}>
							<InputFilesEditor
								simulator={
									yaptideEditor?.contextManager.currentSimulator ||
									SimulatorType.COMMON
								}
								inputFiles={inputFiles}
								closeEditor={() => setShowInputFilesEditor(false)}
								goToRun={(inputFiles?: SimulationInputFiles) => {
									setShowInputFilesEditor(false);
									goToRun(inputFiles);
								}}
								onChange={newInputFiles => setInputFiles(newInputFiles)}
							/>
						</Box>
					</Box>
				</Fade>
			</Modal>
			{auth.isAuthorized ? (
				<SimulationsGrid
					goToResults={goToResults}
					setShowInputFilesEditor={setShowInputFilesEditor}
					setInputFiles={setInputFiles}
					simulator={
						yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON
					}
				/>
			) : (
				<Box></Box>
			)}
		</Box>
	);
}
