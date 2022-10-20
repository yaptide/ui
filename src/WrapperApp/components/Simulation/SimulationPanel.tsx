import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Divider,
	Fade,
	Grid,
	LinearProgress,
	Modal,
	Pagination,
	Stack,
	Typography
} from '@mui/material';
import { flexbox } from '@mui/system';
import { useSnackbar } from 'notistack';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import useInterval from 'use-interval';
import { useLoader } from '../../../services/DataLoaderService';
import {
	FinalSimulationStatusData,
	InputFiles,
	OrderBy,
	OrderType,
	SimulationInfo,
	SimulationStatusData,
	StatusState,
	useShSimulation
} from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import SimulationStatus from './SimulationStatus';
import CableIcon from '@mui/icons-material/Cable';
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
	const [pageCount, setPageCount] = useState(1);
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

	useEffect(() => {
		if (canLoadResultsData) {
			setLoadedResults();
			setLocalSimulationData(resultsProvider);
			setLocalResultsSimulationData(resultsProvider);
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

	const [simulationIDInterval, setSimulationIDInterval] = useState<number | null>(null);

	const [controller] = useState(new AbortController());

	useEffect(() => {
		if (editorRef.current) {
			const hash = editorRef.current.toJSON().hash;
			const anyResults = simulationsStatusData.find(s => s.editor?.hash === hash);
			if (anyResults) editorRef.current.results = anyResults;
			else editorRef.current.results = null;
		}
	}, [simulationsStatusData]);

	useEffect(() => {
		return () => {
			controller.abort();
		};
	}, [controller]);

	const updateSimulationInfo = useCallback(
		() =>
			getSimulations(page, pageSize, orderType, orderBy)
				.then(({ simulations, page_count, simulations_count }) => {
					setSimulationInfo([...simulations]);
					setPageCount(page_count);
				})
				.catch(),
		[controller.signal, getSimulations, orderType, orderBy, page, pageSize]
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
						Server status: {isBackendAlive ? 'Online' : 'Unreachable'}
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
				simulationsStatusData={simulationsStatusData}
				localSimulationData={[]}
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
