import { AccordionDetails, AccordionSummary, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { JobStatusData, SimulationInfo, StatusState } from '../../../types/ResponseTypes';
import useIntervalAsync from '../../../util/hooks/useIntervalAsync';
import BackendSimulationsHelpers from './BackendSimulations/BackendSimulationsHelpers';
import {
	SimulationConfig,
	SimulationHandlers,
	SimulationState
} from './BackendSimulations/BackendSimulationsTypes';
import { useBackendAliveEffect } from './BackendSimulations/hooks/useBackendAliveEffect';
import { useUpdateCurrentSimulationEffect } from './BackendSimulations/hooks/useUpdateCurrentSimulationEffect';
import SimulationCardSmall from './SimulationCard/SimulationCardSmall';

export default function RecentSimulations() {
	const theme = useTheme();

	const { demoMode } = useConfig();
	const {
		yaptideEditor,
		trackedId,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		simulationJobIdsSubmittedInSession
	} = useStore();

	const {
		cancelJob,
		getJobInputs,
		getHelloWorld,
		getPageContents,
		getPageStatus,
		getJobStatus,
		getFullSimulationData
	} = useShSimulation();

	const [isBackendAlive, setBackendAlive] = useState(false);
	const [simulationInfo, setSimulationInfo] = useState<SimulationInfo[]>([]);
	const [simulationsStatusData, setSimulationsStatusData] = useState<JobStatusData[]>();

	const [controller] = useState(new AbortController());

	const config: SimulationConfig = {
		demoMode,
		controller,
		trackedId,
		isBackendAlive,
		setBackendAlive,
		statusStates: [
			StatusState.RUNNING,
			StatusState.PENDING,
			StatusState.MERGING_QUEUED,
			StatusState.MERGING_RUNNING,
			StatusState.COMPLETED
		]
	};

	const handlers: SimulationHandlers = {
		getPageContents,
		getPageStatus,
		getJobStatus,
		getFullSimulationData,
		cancelJob,
		getHelloWorld,
		getJobInputs
	};

	const state: SimulationState = {
		simulationInfo,
		simulationsStatusData,
		setSimulationInfo,
		setSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		goToResults: () => {},
		setInputFiles: () => {},
		setShowInputFilesEditor: () => {},
		yaptideEditor
	};

	const {
		updateSimulationInfo,
		updateSimulationData,
		simulationDataInterval,
		handleLoadResults,
		setPageCount
	} = BackendSimulationsHelpers(config, handlers, state);

	useBackendAliveEffect(config, handlers, updateSimulationInfo, setPageCount);
	useUpdateCurrentSimulationEffect(config, handlers, state);

	useIntervalAsync(updateSimulationData, simulationDataInterval, simulationInfo.length > 0);

	const jobIdsInSession = new Set(simulationJobIdsSubmittedInSession);
	const simulationsToDisplay = simulationsStatusData
		? simulationsStatusData
				.filter(statusData => jobIdsInSession.has(statusData.jobId))
				.slice(0, 5)
		: [];

	return (
		<StyledAccordion
			expanded={true}
			sx={{
				'margin': `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)}`,
				'flexGrow': 1,
				'minHeight': 0,
				'display': 'flex',
				'flexDirection': 'column',
				'& .MuiCollapse-root': {
					overflowY: 'auto'
				}
			}}>
			<AccordionSummary>
				<Typography
					textTransform='none'
					fontSize={16}>
					Last 5 simulations
				</Typography>
			</AccordionSummary>
			<AccordionDetails
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: theme.spacing(1)
				}}>
				{simulationsToDisplay.map(simulation => (
					<SimulationCardSmall
						key={simulation.jobId}
						simulationStatus={simulation}
						loadResults={
							handleLoadResults && (taskId => handleLoadResults(taskId, simulation))
						}
					/>
				))}
			</AccordionDetails>
		</StyledAccordion>
	);
}
