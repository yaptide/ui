import { Box, Fade, Modal } from '@mui/material';
import { useState } from 'react';

import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import { BackendSimulations } from './BackendSimulations/BackendSimulations';

interface SimulationPanelProps {
	goToResults?: () => void;
	forwardedInputFiles?: SimulationInputFiles;
}

export default function SimulationPanel({
	goToResults,
	forwardedInputFiles
}: SimulationPanelProps) {
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
					<Box sx={{ height: '100vh', width: '100vw', overflow: 'auto' }}>
						<InputFilesEditor
							simulator={
								yaptideEditor?.contextManager.currentSimulator ||
								SimulatorType.COMMON
							}
							inputFiles={inputFiles}
							closeEditor={() => setShowInputFilesEditor(false)}
							goToRun={() => {}}
							onChange={newInputFiles => setInputFiles(newInputFiles)}
						/>
					</Box>
				</Fade>
			</Modal>
			<BackendSimulations
				goToResults={goToResults}
				setShowInputFilesEditor={setShowInputFilesEditor}
				setInputFiles={setInputFiles}
				simulator={yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON}
			/>
		</Box>
	);
}
