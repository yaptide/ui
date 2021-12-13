import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	LinearProgress,
	Typography
} from '@mui/material';

import { useCallback, useEffect, useState } from 'react';
import useInterval from 'use-interval';
import {
	SimulationInfo,
	SimulationStatusData,
	StatusState,
	useShSimulation
} from '../../../services/ShSimulationService';
import { useStore } from '../../../services/StoreService';
import SimulationStatus from './SimulationStatus';

interface SimulationPanelProps {
	goToResults?: () => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { editorRef, setResultsSimulationData } = useStore();

	const { sendRun, sendHelloWorld, getSimulations, getSimulationsStatus } = useShSimulation();

	const [isInProgress, setInProgress] = useState(false);

	const [isBackendAlive, setBackendAlive] = useState(false);

	const [trackedId, setTrackedId] = useState<string>();
	const [simulationInfo, setSimulationInfo] = useState<SimulationInfo[]>([]);
	const [simulationsStatusData, setSimulationsStatusData] = useState<SimulationStatusData[]>([]);

	const [simulationIDInterval, setSimulationIDInterval] = useState<number | null>(null);

	const [controller] = useState(new AbortController());

	useEffect(() => {
		return () => {
			controller.abort();
		};
	}, [controller]);

	const updateSimulationInfo = useCallback(
		() =>
			getSimulations(controller.signal)
				.then(s => setSimulationInfo([...s]))
				.catch(),
		[controller.signal, getSimulations]
	);

	useEffect(() => {
		sendHelloWorld(controller.signal)
			.then(() => {
				setBackendAlive(true);
				updateSimulationInfo();
				setSimulationIDInterval(10000);
			})
			.catch(() => {
				setBackendAlive(false);
			});
	}, [controller.signal, getSimulations, isBackendAlive, sendHelloWorld, updateSimulationInfo]);

	useInterval(updateSimulationInfo, simulationIDInterval, true);

	const updateSimulationData = useCallback(
		() =>
			getSimulationsStatus(simulationInfo, controller.signal, true, (id, res) => {
				if (id === trackedId && res.content.state === StatusState.SUCCESS)
					setResultsSimulationData(res.content.result);
			}).then(s => {
				setSimulationsStatusData([...s.reverse()]);
			}),
		[
			controller.signal,
			getSimulationsStatus,
			setResultsSimulationData,
			simulationInfo,
			trackedId
		]
	);

	useEffect(() => {
		updateSimulationData();
	}, [updateSimulationData]);

	useInterval(
		updateSimulationData,
		simulationIDInterval !== null && simulationInfo.length > 0 ? 1000 : null,
		true
	);

	const onClickRun = () => {
		setInProgress(true);
		sendRun(editorRef.current?.toJSON(), controller.signal)
			.then(res => {
				updateSimulationInfo();
				setTrackedId(res.content.task_id);
			})
			.catch()
			.finally(() => setInProgress(false));
	};

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(960px, 100%)',
				padding: '5rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem',
				height: 'min-content'
			}}>
			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography gutterBottom variant='h5' component='div'>
						Backend Status - {isBackendAlive ? 'ALIVE' : 'DEAD'}
					</Typography>
				</CardContent>
			</Card>

			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography gutterBottom variant='h5' component='div'>
						Run Simulation
					</Typography>
					<LinearProgress
						variant={isInProgress ? 'indeterminate' : 'determinate'}
						value={0}
					/>
				</CardContent>
				<CardActions>
					<Button
						sx={{
							width: 'min(300px, 100%)',
							margin: '0 auto'
						}}
						onClick={onClickRun}>
						{isInProgress ? 'Stop' : 'Start'}
					</Button>
				</CardActions>
			</Card>

			{simulationsStatusData.map(simulation => (
				<SimulationStatus
					key={simulation.uuid}
					simulation={simulation}
					loadResults={id => {
						if (id === null) props.goToResults?.call(null);
						else setResultsSimulationData(simulation);
					}}></SimulationStatus>
			))}
		</Box>
	);
}
