import { AccordionDetails, AccordionSummary, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useGeant4LocalWorkerSimulation } from '../../../services/Geant4LocalWorkerSimulationContextProvider';
import { useRemoteWorkerSimulation } from '../../../services/RemoteWorkerSimulationContextProvider';
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

	const remoteWorkerSimulationHandlers = useRemoteWorkerSimulation();
	const geant4LocalWorkerSimulationHandlers = useGeant4LocalWorkerSimulation();

	const [isBackendAlive, setBackendAlive] = useState(false);
	const [remoteWorkerSimulationInfo, setRemoteWorkerSimulationInfo] = useState<SimulationInfo[]>(
		[]
	);

	const [geant4LocalWorkerSimulationInfo, setGeant4LocalWorkerSimulationInfo] = useState<
		SimulationInfo[]
	>([]);

	const [remoteWorkerSimulationsStatusData, setRemoteWorkerSimulationsStatusData] =
		useState<JobStatusData[]>();

	const [geant4LocalWorkerSimulationsStatusData, setGeant4LocalWorkerSimulationsStatusData] =
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

	const remoteWorkerState: SimulationState = {
		simulationInfo: remoteWorkerSimulationInfo,
		simulationsStatusData: remoteWorkerSimulationsStatusData,
		setSimulationInfo: setRemoteWorkerSimulationInfo,
		setSimulationsStatusData: setRemoteWorkerSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		goToResults: () => {},
		setInputFiles: () => {},
		setShowInputFilesEditor: () => {},
		yaptideEditor
	};

	const geant4LocalWorkerState: SimulationState = {
		simulationInfo: geant4LocalWorkerSimulationInfo,
		simulationsStatusData: geant4LocalWorkerSimulationsStatusData,
		setSimulationInfo: setGeant4LocalWorkerSimulationInfo,
		setSimulationsStatusData: setGeant4LocalWorkerSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		goToResults: () => {},
		setInputFiles: () => {},
		setShowInputFilesEditor: () => {},
		yaptideEditor
	};

	const {
		updateSimulationInfo: remoteWorkerUpdateSimulationInfo,
		updateSimulationData: remoteWorkerUpdateSimulationData,
		simulationDataInterval: remoteWorkerSimulationDataInterval,
		handleLoadResults: remoteWorkerHandleLoadResults,
		setPageCount: setRemoteWorkerPageCount
	} = SimulationsGridHelpers(config, remoteWorkerSimulationHandlers, remoteWorkerState);

	const {
		updateSimulationInfo: geant4LocalWorkerUpdateSimulationInfo,
		updateSimulationData: geant4LocalWorkerUpdateSimulationData,
		simulationDataInterval: geant4LocalWorkerSimulationDataInterval,
		handleLoadResults: geant4LocalWorkerHandleLoadResults
	} = SimulationsGridHelpers(config, geant4LocalWorkerSimulationHandlers, geant4LocalWorkerState);

	useBackendAliveEffect(
		config,
		remoteWorkerSimulationHandlers,
		() => {
			if (auth.isAuthorized) {
				remoteWorkerUpdateSimulationInfo();
			}
		},
		setRemoteWorkerPageCount
	);

	useBackendAliveEffect(
		config,
		geant4LocalWorkerSimulationHandlers,
		geant4LocalWorkerUpdateSimulationInfo,
		setRemoteWorkerPageCount
	);

	useUpdateCurrentSimulationEffect(config, remoteWorkerSimulationHandlers, remoteWorkerState);
	useUpdateCurrentSimulationEffect(
		config,
		geant4LocalWorkerSimulationHandlers,
		geant4LocalWorkerState
	);

	useIntervalAsync(
		remoteWorkerUpdateSimulationData,
		remoteWorkerSimulationDataInterval,
		remoteWorkerSimulationInfo.length > 0
	);

	useIntervalAsync(
		geant4LocalWorkerUpdateSimulationData,
		geant4LocalWorkerSimulationDataInterval,
		geant4LocalWorkerSimulationInfo.length > 0
	);

	const remoteWorkerJobIdsInSession = new Set(
		simulationJobIdsSubmittedInSession
			.filter(job => job.source === 'remote')
			.map(job => job.jobId)
	);

	const sortFn = useCallback(
		(s1: SimulationInfo, s2: SimulationInfo) =>
			new Date(s2.startTime).getTime() - new Date(s1.startTime).getTime(),
		[]
	);

	const remoteWorkerSimulationsToDisplay = remoteWorkerSimulationsStatusData
		? remoteWorkerSimulationsStatusData
				.filter(statusData => remoteWorkerJobIdsInSession.has(statusData.jobId))
				.sort(sortFn)
				.slice(0, 5)
		: [];

	const geant4LocalWorkerJobIdsInSession = new Set(
		simulationJobIdsSubmittedInSession
			.filter(job => job.source === 'local')
			.map(job => job.jobId)
	);

	const geant4LocalWorkerSimulationsToDisplay = geant4LocalWorkerSimulationsStatusData
		? geant4LocalWorkerSimulationsStatusData
				.filter(statusData => geant4LocalWorkerJobIdsInSession.has(statusData.jobId))
				.sort(sortFn)
				.slice(0, 5)
		: [];

	const simulationsToDisplay = [
		...remoteWorkerSimulationsToDisplay,
		...geant4LocalWorkerSimulationsToDisplay
	]
		.sort(sortFn)
		.slice(0, 5);

	const loadResultsFn = useCallback(
		(simulation: SimulationInfo) => {
			if (
				geant4LocalWorkerJobIdsInSession.has(simulation.jobId) &&
				geant4LocalWorkerHandleLoadResults
			) {
				return (taskId: string | null) =>
					geant4LocalWorkerHandleLoadResults(taskId, simulation);
			}

			if (
				remoteWorkerJobIdsInSession.has(simulation.jobId) &&
				remoteWorkerHandleLoadResults
			) {
				return (taskId: string | null) => remoteWorkerHandleLoadResults(taskId, simulation);
			}

			return (taskId: string | null) => {};
		},
		[
			geant4LocalWorkerJobIdsInSession,
			geant4LocalWorkerHandleLoadResults,
			remoteWorkerJobIdsInSession,
			remoteWorkerHandleLoadResults
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
