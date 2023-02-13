import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Divider,
	Fade,
	LinearProgress,
	Modal,
	Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';

import CableIcon from '@mui/icons-material/Cable';
import { useCallback, useEffect, useState } from 'react';
import useInterval from 'use-interval';
import { useLoader } from '../../../services/DataLoaderService';
import {
	InputFiles,
	OrderBy,
	OrderType,
	SimulationInfo,
	SimulationStatusData,
	StatusState,
	useShSimulation
} from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import EXAMPLES from '../../../ThreeEditor/examples/examples';
import { DEMO_MODE } from '../../../util/Config';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import { SimulationPanelGrid } from './SimulationPanelGrid';

interface SimulationPanelProps {
	goToResults?: () => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const {
		editorRef,
		setResultsSimulationData,
		localResultsSimulationData,
		setLocalResultsSimulationData
	} = useStore();

	const { sendRun, sendHelloWorld, getSimulations, getSimulationsStatus } = useShSimulation();
	const { enqueueSnackbar } = useSnackbar();

	const [isInProgress, setInProgress] = useState(false);
	const [isBackendAlive, setBackendAlive] = useState(false);
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);
	const [page, setPage] = useState(1);
	const [pageCount, setPageCount] = useState(0);
	const [orderType, setOrderType] = useState<OrderType>(OrderType.ASCEND);
	const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.START_TIME);
	const [pageSize, setPageSize] = useState(4);

	const [inputFiles, setInputFiles] = useState<InputFiles>();

	const [trackedId, setTrackedId] = useState<string>();
	const [simulationInfo, setSimulationInfo] = useState<SimulationInfo[]>([]);
	const [simulationsStatusData, setSimulationsStatusData] = useState<SimulationStatusData[]>([]);
	const [localSimulationData, setLocalSimulationData] = useState<SimulationStatusData[]>(
		localResultsSimulationData ?? []
	);

	const { resultsProvider, canLoadResultsData, setLoadedResults } = useLoader();

	const [simulationIDInterval, setSimulationIDInterval] = useState<number | null>(null);

	const [controller] = useState(new AbortController());

	const updateSimulationInfo = useCallback(
		() =>
			getSimulations(page, pageSize, orderType, orderBy)
				.then(({ simulations, page_count, simulations_count }) => {
					setSimulationInfo([...simulations]);
					setPageCount(page_count);
				})
				.catch(),
		[getSimulations, orderType, orderBy, page, pageSize]
	);
	const refreshPage = useCallback(
		(
			page: number,
			pageSize: number,
			orderType: OrderType,
			orderBy: OrderBy,
			signal?: AbortSignal | undefined
		) =>
			getSimulations(page, pageSize, orderType, orderBy, signal)
				.then(({ simulations, page_count, simulations_count }) => {
					setSimulationInfo([...simulations]);
					setPageCount(page_count);
				})
				.catch(),
		[getSimulations]
	);
	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setPage(page);
		refreshPage(page, pageSize, orderType, orderBy, controller.signal);
	};

	const handleOrderChange = (orderType: OrderType, orderBy: OrderBy, pageSize: number) => {
		setOrderType(orderType);
		setOrderBy(orderBy);
		setPageSize(pageSize);
		refreshPage(page, pageSize, orderType, orderBy, controller.signal);
	};

	const updateSimulationData = useCallback(
		() =>
			!DEMO_MODE &&
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

	useEffect(() => {
		if (!DEMO_MODE && editorRef.current) {
			const hash = editorRef.current.toJSON().hash;
			const anyResults = simulationsStatusData.find(s => s.editor?.hash === hash);
			if (anyResults) editorRef.current.results = anyResults;
			else editorRef.current.results = null;
		}
	}, [simulationsStatusData, editorRef]);

	useEffect(() => {
		return () => {
			controller.abort();
		};
	}, [controller]);

	useEffect(() => {
		if (!DEMO_MODE)
			sendHelloWorld(controller.signal)
				.then(() => {
					setBackendAlive(true);
					updateSimulationInfo();
					setSimulationIDInterval(10000);
				})
				.catch(() => {
					setBackendAlive(false);
				});
	}, [
		controller.signal,
		sendHelloWorld,
		updateSimulationInfo,
		setSimulationIDInterval,
		isBackendAlive,
		setBackendAlive
	]);

	useInterval(updateSimulationInfo, simulationIDInterval, true);

	useEffect(() => {
		updateSimulationData();
	}, [updateSimulationData]);

	useInterval(
		updateSimulationData,
		simulationIDInterval !== null && simulationInfo.length > 0 ? 1000 : null,
		true
	);

	useEffect(() => {
		if (canLoadResultsData) {
			setLoadedResults();
			const newLocalData = resultsProvider;
			newLocalData.forEach(data => {
				data.status = StatusState.LOCAL;
			});
			setLocalSimulationData(newLocalData);
			setLocalResultsSimulationData(newLocalData);
		} else {
			setLocalSimulationData(localResultsSimulationData ?? []);
		}
	}, [
		canLoadResultsData,
		resultsProvider,
		setLoadedResults,
		localResultsSimulationData,
		setLocalResultsSimulationData
	]);

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(1200px, 100%)',
				height: '100%',
				boxSizing: 'border-box',
				padding: '2rem 5rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem'
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

			<Card sx={{ minWidth: 275, flexShrink: 0 }}>
				<CardContent
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
					<Typography
						gutterBottom
						variant='h5'
						component='p'
						sx={{ mb: 0, lineHeight: '2rem' }}>
						{!DEMO_MODE
							? `Server status: ${isBackendAlive ? 'Online' : 'Unreachable'}`
							: 'Demo results'}
					</Typography>
					<CableIcon
						color={isBackendAlive ? 'success' : 'disabled'}
						sx={{ marginLeft: 'auto' }}
						fontSize='large'></CableIcon>
				</CardContent>
				<Divider />
				{isBackendAlive && (
					<>
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
					</>
				)}
			</Card>
			<SimulationPanelGrid
				simulationsStatusData={!DEMO_MODE ? simulationsStatusData : EXAMPLES}
				localSimulationData={localSimulationData}
				handleLoadResults={(id, simulation) => {
					if (id === null) props.goToResults?.call(null);
					else setResultsSimulationData(simulation);
				}}
				handleShowInputFiles={(inputFiles?) => {
					setShowInputFilesEditor(true);
					setInputFiles(inputFiles);
				}}
				pageCount={pageCount}
				page={page}
				pageSize={pageSize}
				handlePageChange={handlePageChange}
				orderType={orderType}
				orderBy={orderBy}
				handleOrderChange={handleOrderChange}
			/>
		</Box>
	);
}
