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
import { StatusState, useShSimulation } from '../../../services/ShSimulationService';
import { useStore } from '../../../services/StoreService';
import SimulationStatus, { SimulationStatusData } from './SimulationStatus';

interface SimulationPanelProps {
	onError?: (error: unknown) => void;
	onSuccess?: (result: unknown) => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { editorRef } = useStore();

	const { sendRun, sendHelloWorld, getSimulations, getSimulationsStatus } = useShSimulation();

	const [isInProgress, setInProgress] = useState(false);

	const [isBackendAlive, setBackendAlive] = useState(false);

	const [trackedId, setTrackedId] = useState<string>();
	const [simulationIDs, setSimulationIDs] = useState<string[]>([]);
	const [simulationsData, setSimulationsData] = useState<SimulationStatusData[]>([]);

	const [simulationIDInterval, setSimulationIDInterval] = useState<number | null>(null);

	const [controller] = useState(new AbortController());

	useEffect(() => {
		return () => {
			controller.abort();
		};
	}, [controller]);

	const updateSimulationIDs = useCallback(
		() =>
			getSimulations(controller.signal)
				.then(s => setSimulationIDs([...s]))
				.catch(),
		[controller.signal, getSimulations]
	);

	useEffect(() => {
		sendHelloWorld(controller.signal)
			.then(() => {
				setBackendAlive(true);
				updateSimulationIDs();
				setSimulationIDInterval(10000);
			})
			.catch(() => {
				setBackendAlive(false);
			});
	}, [controller.signal, getSimulations, isBackendAlive, sendHelloWorld, updateSimulationIDs]);

	useInterval(updateSimulationIDs, simulationIDInterval, true);

	const updateSimulationData = useCallback(
		() =>
			getSimulationsStatus(simulationIDs, controller.signal, true, (id, res) => {
				if (id === trackedId && res.content.state === StatusState.SUCCESS)
					props.onSuccess?.call(null, res.content.result);
			}).then(s => {
				setSimulationsData([...s.reverse()]);
			}),
		[controller.signal, getSimulationsStatus, props.onSuccess, simulationIDs, trackedId]
	);

	useEffect(() => {
		updateSimulationData();
	}, [updateSimulationData]);

	useInterval(
		updateSimulationData,
		simulationIDInterval !== null && simulationIDs.length > 0 ? 1000 : null,
		true
	);

	const onClickRun = () => {
		setInProgress(true);
		sendRun(editorRef.current?.toJSON(), controller.signal)
			.then(res => {
				setSimulationIDs(old => [...old, res.content.task_id]);
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

			{simulationsData.map(simulation => (
				<SimulationStatus
					key={simulation.uuid}
					simulation={simulation}
					loadResults={() => {
						props.onSuccess?.call(null, simulation.result);
					}}></SimulationStatus>
			))}
		</Box>
	);
}
