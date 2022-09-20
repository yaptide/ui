import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Fade,
	LinearProgress,
	Modal,
	Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useCallback, useEffect, useState } from 'react';
import useInterval from 'use-interval';
import {
	InputFiles,
	SimulationInfo,
	SimulationStatusData,
	StatusState,
	useShSimulation
} from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import SimulationStatus from './SimulationStatus';

interface SimulationPanelProps {
	goToResults?: () => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { editorRef, setResultsSimulationData } = useStore();

	const { sendRun, sendHelloWorld, getSimulations, getSimulationsStatus } = useShSimulation();
	const { enqueueSnackbar } = useSnackbar();

	const [isInProgress, setInProgress] = useState(false);
	const [isBackendAlive, setBackendAlive] = useState(false);
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);

	const [inputFiles, setInputFiles] = useState<InputFiles>();

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
			getSimulationsStatus(simulationInfo, controller.signal, true, (id, data) => {
				if (id === trackedId && data.status === StatusState.SUCCESS)
					setResultsSimulationData(data);
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

	const runSimulation = (inputFiles?: InputFiles) => {
		setInProgress(true);
		const input = inputFiles ? { inputFiles } : { editorJSON: editorRef.current?.toJSON() };
		sendRun(input, controller.signal)
			.then(res => {
				updateSimulationInfo();
				setTrackedId(res.task_id);
			})
			.catch(e => {
				enqueueSnackbar('Error while starting simulation', { variant: 'error' });
				console.error(e);
			})
			.finally(() => setInProgress(false));
	};

	const onClickRun = () => runSimulation();

	const handleEditorModal = () => {
		setShowInputFilesEditor(false);
	};

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(960px, 100%)',
				padding: '2rem 5rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem',
				height: 'min-content'
			}}>
			<Modal
				aria-labelledby='transition-modal-title'
				aria-describedby='transition-modal-description'
				open={showInputFilesEditor}
				onClose={handleEditorModal}
				closeAfterTransition>
				<Fade in={showInputFilesEditor}>
					<Box sx={{ height: '100vh', width: '100vw', overflow: 'auto' }}>
						<InputFilesEditor
							inputFiles={inputFiles}
							closeEditor={() => setShowInputFilesEditor(false)}
							runSimulation={newInputFiles => {
								setShowInputFilesEditor(false);
								setInputFiles(newInputFiles);
								runSimulation(newInputFiles);
							}}></InputFilesEditor>
					</Box>
				</Fade>
			</Modal>

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
						color='info'
						variant={isInProgress ? 'indeterminate' : 'determinate'}
						value={0}
					/>
				</CardContent>
				<CardActions>
					<Button
						color='info'
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
					}}
					showInputFiles={inputFiles => {
						setShowInputFilesEditor(true);
						setInputFiles(inputFiles);
					}}></SimulationStatus>
			))}
		</Box>
	);
}
