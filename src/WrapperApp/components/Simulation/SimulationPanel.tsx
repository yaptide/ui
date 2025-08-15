import { Box, Fade, Modal } from '@mui/material';
import { useState } from 'react';

import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import { BackendSimulations } from './BackendSimulations/BackendSimulations';

interface SimulationPanelProps {
	goToResults?: () => void;
	forwardedInputFiles?: SimulationInputFiles;
	forwardedSimulator: SimulatorType;
}

export default function SimulationPanel({
	goToResults,
	forwardedInputFiles,
	forwardedSimulator
}: SimulationPanelProps) {
	/** Visibility Flags */
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);

	/** Simulation Run Options */
	const [inputFiles, setInputFiles] = useState(forwardedInputFiles);
	const [simulator] = useState<SimulatorType>(forwardedSimulator);

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
							simulator={simulator}
							inputFiles={inputFiles}
							closeEditor={() => setShowInputFilesEditor(false)}
							goToRun={() => {}}
							onChange={newInputFiles =>
								setInputFiles(newInputFiles)
							}></InputFilesEditor>
					</Box>
				</Fade>
			</Modal>
			<BackendSimulations
				goToResults={goToResults}
				setShowInputFilesEditor={setShowInputFilesEditor}
				setInputFiles={setInputFiles}
				simulator={simulator}
			/>
		</Box>
	);
}
