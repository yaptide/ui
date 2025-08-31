import { AccordionDetails, AccordionSummary, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

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

export default function RunningQueue() {
	const theme = useTheme();

	const { demoMode } = useConfig();
	const {
		yaptideEditor,
		trackedId,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		simulationsCompletedInSession,
		setSimulationsCompletedInSession
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
			StatusState.MERGING_RUNNING
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
		goToResults: () => console.log('go to results'),
		setInputFiles: () => {},
		setShowInputFilesEditor: () => {},
		yaptideEditor
	};

	const {
		updateSimulationInfo,
		updateSimulationData,
		simulationDataInterval,
		handleLoadResults,
		handleShowInputFiles,
		setPageCount
	} = BackendSimulationsHelpers(config, handlers, state);

	useBackendAliveEffect(config, handlers, updateSimulationInfo, setPageCount);
	useUpdateCurrentSimulationEffect(config, handlers, state);

	useIntervalAsync(updateSimulationData, simulationDataInterval, simulationInfo.length > 0);

	// We need to display running simulations and recently completed simulations (at least until page reload)
	// In order to do that and not add more one-off logic to our convoluted backend connection implementation,
	// we fetch only PENDING, RUNNING, MERGING simulations, save the ones that complete, and render them above the rest.
	//
	// The backend refresh works in such a way, that once the simulation list is populated,
	// it only refreshes the simulations that were fetched initially, so PENDING, RUNNING, MERGING
	// really means P, R, M + all that could come afterwards.
	// That is, until the component reloads, i.e goes out of, and back to view
	//
	// We somewhat rely on this behavior, so we can filter out completed simulations and save them to state
	useEffect(() => {
		const completed =
			simulationsStatusData?.filter(sd => sd.jobState === StatusState.COMPLETED) ?? [];

		if (completed.length > 0) {
			setSimulationsCompletedInSession(prev => ({
				...prev,
				...Object.fromEntries(completed.map(v => [v.jobId, v]))
			}));

			setSimulationInfo(prev =>
				prev.filter(info => completed.findIndex(v => v.jobId === info.jobId) < 0)
			);
			updateSimulationData();
		}
	}, [simulationsStatusData]);

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
					Queue
				</Typography>
			</AccordionSummary>
			<AccordionDetails
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: theme.spacing(1)
				}}>
				{/* Completed simulations that don't need updates */}
				{Object.values(simulationsCompletedInSession).map(cs => (
					<SimulationCardSmall
						key={cs.jobId}
						simulationStatus={cs}
						loadResults={handleLoadResults && (taskId => handleLoadResults(taskId, cs))}
						handleDelete={() => {}}
						handleCancel={() => {}}
						handleRefresh={() => {}}
						showInputFiles={handleShowInputFiles}
					/>
				))}
				{/* Simulations in progress that need updates */}
				{simulationsStatusData &&
					simulationsStatusData.length > 0 &&
					simulationsStatusData?.map(simulation => (
						<SimulationCardSmall
							key={simulation.jobId}
							simulationStatus={simulation}
							loadResults={
								handleLoadResults &&
								(taskId => handleLoadResults(taskId, simulation))
							}
							handleDelete={() => {}}
							handleCancel={() => {}}
							handleRefresh={() => {}}
							showInputFiles={handleShowInputFiles}
						/>
					))}
			</AccordionDetails>
		</StyledAccordion>
	);
}
