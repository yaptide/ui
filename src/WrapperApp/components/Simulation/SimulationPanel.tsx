import { Box, Fade, Modal, useTheme } from '@mui/material';
import { useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import { StyledTab, StyledTabs } from '../../../shared/components/Tabs/StyledTabs';
import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import { Geant4WorkersSimulationsGrid } from './SimulationsGrid/Geant4WorkersSimulationsGrid';
import { useIsBackendAlive } from './SimulationsGrid/hooks/useBackendAliveEffect';
import { RestSimulationsGrid } from './SimulationsGrid/RestSimulationsGrid';

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
	const { yaptideEditor } = useStore();
	const { demoMode } = useConfig();
	const auth = useAuth();
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);
	const [inputFiles, setInputFiles] = useState(forwardedInputFiles);
	const isBackendAlive = useIsBackendAlive();
	const [source, setSource] = useState<'server' | 'worker'>(
		!isBackendAlive || !auth.isAuthorized || demoMode ? 'worker' : 'server'
	);

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

			{isBackendAlive && auth.isAuthorized && (
				<StyledTabs
					value={source}
					onChange={(_, v) => setSource(v)}
					sx={{ m: 1 }}>
					<StyledTab
						label='Simulations from server'
						value='server'
						key='server'
					/>
					<StyledTab
						label='Local simulations'
						value='worker'
						key='worker'
					/>
				</StyledTabs>
			)}

			{source === 'server' ? (
				<RestSimulationsGrid
					goToResults={goToResults}
					setShowInputFilesEditor={setShowInputFilesEditor}
					setInputFiles={setInputFiles}
					simulator={
						yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON
					}
				/>
			) : (
				<Geant4WorkersSimulationsGrid
					goToResults={goToResults}
					setInputFiles={setInputFiles}
					setShowInputFilesEditor={setShowInputFilesEditor}
					simulator={SimulatorType.GEANT4}
				/>
			)}
		</Box>
	);
}
