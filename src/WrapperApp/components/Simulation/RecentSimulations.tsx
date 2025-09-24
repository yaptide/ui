import { AccordionDetails, AccordionSummary, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useGeant4WorkersSimulation } from '../../../services/Geant4WorkersSimulationContextProvider';
import { useRestSimulation } from '../../../services/RestSimulationContextProvider';
import { useStore } from '../../../services/StoreService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { JobStatusData, SimulationInfo, StatusState } from '../../../types/ResponseTypes';
import useIntervalAsync from '../../../util/hooks/useIntervalAsync';
import SimulationCardSmall from './SimulationCard/SimulationCardSmall';
import { useBackendAliveEffect } from './SimulationsGrid/hooks/useBackendAliveEffect';
import { useUpdateCurrentSimulationEffect } from './SimulationsGrid/hooks/useUpdateCurrentSimulationEffect';
import SimulationsGridHelpers from './SimulationsGrid/SimulationsGridHelpers';
import { SimulationConfig, SimulationState } from './SimulationsGrid/SimulationsGridTypes';

export default function RecentSimulations() {
	const theme = useTheme();

	const auth = useAuth();
	const { demoMode } = useConfig();
	const {
		yaptideEditor,
		trackedId,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		simulationJobIdsSubmittedInSession
	} = useStore();

	const restHandlers = useRestSimulation();
	const geant4WorkerHandlers = useGeant4WorkersSimulation();

	const [isBackendAlive, setBackendAlive] = useState(false);
	const [restSimulationInfo, setRestSimulationInfo] = useState<SimulationInfo[]>([]);
	const [geant4WorkerSimulationInfo, setGeant4WorkerSimulationInfo] = useState<SimulationInfo[]>(
		[]
	);
	const [restSimulationsStatusData, setRestSimulationsStatusData] = useState<JobStatusData[]>();
	const [geant4WorkerSimulationsStatusData, setGeant4WorkerSimulationsStatusData] =
		useState<JobStatusData[]>();

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

	const restState: SimulationState = {
		simulationInfo: restSimulationInfo,
		simulationsStatusData: restSimulationsStatusData,
		setSimulationInfo: setRestSimulationInfo,
		setSimulationsStatusData: setRestSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		goToResults: () => {},
		setInputFiles: () => {},
		setShowInputFilesEditor: () => {},
		yaptideEditor
	};

	const geant4WorkerState: SimulationState = {
		simulationInfo: geant4WorkerSimulationInfo,
		simulationsStatusData: geant4WorkerSimulationsStatusData,
		setSimulationInfo: setGeant4WorkerSimulationInfo,
		setSimulationsStatusData: setGeant4WorkerSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		goToResults: () => {},
		setInputFiles: () => {},
		setShowInputFilesEditor: () => {},
		yaptideEditor
	};

	const {
		updateSimulationInfo: restUpdateSimulationInfo,
		updateSimulationData: restUpdateSimulationData,
		simulationDataInterval: restSimulationDataInterval,
		handleLoadResults: restHandleLoadResults,
		setPageCount: setRestPageCount
	} = SimulationsGridHelpers(config, restHandlers, restState);

	const {
		updateSimulationInfo: geant4WorkerUpdateSimulationInfo,
		updateSimulationData: geant4WorkerUpdateSimulationData,
		simulationDataInterval: geant4WorkerSimulationDataInterval,
		handleLoadResults: geant4WorkerHandleLoadResults
	} = SimulationsGridHelpers(config, geant4WorkerHandlers, geant4WorkerState);

	useBackendAliveEffect(
		config,
		restHandlers,
		() => {
			if (auth.isAuthorized) {
				restUpdateSimulationInfo();
			}
		},
		setRestPageCount
	);

	useBackendAliveEffect(
		config,
		geant4WorkerHandlers,
		geant4WorkerUpdateSimulationInfo,
		setRestPageCount
	);

	useUpdateCurrentSimulationEffect(config, restHandlers, restState);
	useUpdateCurrentSimulationEffect(config, geant4WorkerHandlers, geant4WorkerState);

	useIntervalAsync(
		restUpdateSimulationData,
		restSimulationDataInterval,
		restSimulationInfo.length > 0
	);

	useIntervalAsync(
		geant4WorkerUpdateSimulationData,
		geant4WorkerSimulationDataInterval,
		geant4WorkerSimulationInfo.length > 0
	);

	const restJobIdsInSession = new Set(
		simulationJobIdsSubmittedInSession
			.filter(job => job.source === 'rest')
			.map(job => job.jobId)
	);

	const restSimulationsToDisplay = restSimulationsStatusData
		? restSimulationsStatusData
				.filter(statusData => restJobIdsInSession.has(statusData.jobId))
				.slice(0, 5)
		: [];

	const geant4WorkerJobIdsInSession = new Set(
		simulationJobIdsSubmittedInSession
			.filter(job => job.source === 'worker')
			.map(job => job.jobId)
	);

	const geant4WorkerSimulationsToDisplay = geant4WorkerSimulationsStatusData
		? geant4WorkerSimulationsStatusData
				.filter(statusData => geant4WorkerJobIdsInSession.has(statusData.jobId))
				.slice(0, 5)
		: [];

	const simulationsToDisplay = [...restSimulationsToDisplay, ...geant4WorkerSimulationsToDisplay]
		.sort((s1, s2) => new Date(s1.startTime).getTime() - new Date(s2.startTime).getTime())
		.slice(0, 5);

	const loadResultsFn = useCallback(
		(simulation: SimulationInfo) => {
			if (
				geant4WorkerJobIdsInSession.has(simulation.jobId) &&
				geant4WorkerHandleLoadResults
			) {
				return (taskId: string | null) => geant4WorkerHandleLoadResults(taskId, simulation);
			}

			if (restJobIdsInSession.has(simulation.jobId) && restHandleLoadResults) {
				return (taskId: string | null) => restHandleLoadResults(taskId, simulation);
			}

			return (taskId: string | null) => {};
		},
		[
			geant4WorkerJobIdsInSession,
			geant4WorkerHandleLoadResults,
			restJobIdsInSession,
			restHandleLoadResults
		]
	);

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
						loadResults={loadResultsFn(simulation)}
					/>
				))}
			</AccordionDetails>
		</StyledAccordion>
	);
}
