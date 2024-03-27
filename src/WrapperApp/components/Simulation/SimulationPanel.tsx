import { Box, Fade, Modal } from '@mui/material';
import { useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { isFullSimulationData } from '../../../services/LoaderService';
import { useStore } from '../../../services/StoreService';
import EXAMPLES from '../../../ThreeEditor/examples/examples';
import { SimulatorType } from '../../../types/RequestTypes';
import {
	currentJobStatusData,
	SimulationInputFiles,
	StatusState
} from '../../../types/ResponseTypes';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import { BackendSimulations } from './BackendSimulations';
import { DemoCardGrid } from './SimulationCardGrid';

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
	const { demoMode } = useConfig();
	const { setResultsSimulationData, localResultsSimulationData } = useStore();

	/** Visibility Flags */
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);

	/** Simulation Run Options */
	const [inputFiles, setInputFiles] = useState(forwardedInputFiles);
	const [simulator] = useState<SimulatorType>(forwardedSimulator);

	const handleLoadResults = async (taskId: string | null, simulation: unknown) => {
		if (taskId === null) return goToResults?.call(null);

		if (currentJobStatusData[StatusState.COMPLETED](simulation)) {
			if (isFullSimulationData(simulation)) setResultsSimulationData(simulation);
			else throw new Error('Simulation data is not complete');
		}
	};

	const handleShowInputFiles = (inputFiles?: SimulationInputFiles) => {
		setShowInputFilesEditor(true);
		setInputFiles(inputFiles);
	};

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(1600px, 100%)',
				maxWidth: 'max(75%, 966px)',
				height: '100%',
				boxSizing: 'border-box',
				padding: ({ spacing }) => spacing(2, 5),
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem',
				scrollPadding: ({ spacing }) => spacing(2)
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
							onChange={newInputFiles =>
								setInputFiles(newInputFiles)
							}></InputFilesEditor>
					</Box>
				</Fade>
			</Modal>
			<DemoCardGrid
				simulations={localResultsSimulationData}
				title='Local Simulation Results'
				handleLoadResults={handleLoadResults}
				handleShowInputFiles={handleShowInputFiles}
			/>
			{demoMode ? (
				<DemoCardGrid
					simulations={Object.values(EXAMPLES).flat()}
					title='Demo Simulation Results'
					handleLoadResults={handleLoadResults}
					handleDelete={() => {}}
					handleShowInputFiles={handleShowInputFiles}
				/>
			) : (
				<BackendSimulations
					goToResults={goToResults}
					setShowInputFilesEditor={setShowInputFilesEditor}
					setInputFiles={setInputFiles}
				/>
			)}
		</Box>
	);
}
