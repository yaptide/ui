import { Box, Fade, Modal, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import { StyledTab, StyledTabs } from '../../../shared/components/Tabs/StyledTabs';
import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import { Geant4LocalWorkerSimulationsGrid } from './SimulationsGrid/Geant4LocalWorkerSimulationsGrid';
import { useIsBackendAlive } from './SimulationsGrid/hooks/useBackendAliveEffect';
import { RemoteWorkerSimulationsGrid } from './SimulationsGrid/RemoteWorkerSimulationsGrid';

interface SimulationPanelProps {
	goToResults?: () => void;
	goToRun: (inputFiles?: SimulationInputFiles) => void;
	forwardedInputFiles?: SimulationInputFiles;
	source: SimulationFetchSource;
	setSource: (source: SimulationFetchSource) => void;
}

export default function SimulationPanel({
	goToResults,
	goToRun,
	forwardedInputFiles,
	source,
	setSource
}: SimulationPanelProps) {
	const theme = useTheme();
	const { yaptideEditor } = useStore();
	const { demoMode } = useConfig();
	const auth = useAuth();
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);
	const [inputFiles, setInputFiles] = useState(forwardedInputFiles);
	const isBackendAlive = useIsBackendAlive();
	const [source, setSource] = useState<'remote' | 'local'>(
		!isBackendAlive || !auth.isAuthorized || demoMode ? 'local' : 'remote'
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
						value='remote'
						key='remote'
					/>
					<StyledTab
						label='Local simulations'
						value='local'
						key='local'
					/>
				</StyledTabs>
			)}

			{source === 'remote' ? (
				<RemoteWorkerSimulationsGrid
					goToResults={goToResults}
					setShowInputFilesEditor={setShowInputFilesEditor}
					setInputFiles={setInputFiles}
					simulator={
						yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON
					}
				/>
			) : (
				<Geant4LocalWorkerSimulationsGrid
					goToResults={goToResults}
					setInputFiles={setInputFiles}
					setShowInputFilesEditor={setShowInputFilesEditor}
					simulator={SimulatorType.GEANT4}
				/>
			)}
		</Box>
	);
}
