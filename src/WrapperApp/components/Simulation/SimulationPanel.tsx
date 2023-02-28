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
import EXAMPLES from '../../../ThreeEditor/examples/examples';
import { useLoader } from '../../../services/DataLoaderService';
import { InputFiles, OrderBy, OrderType } from '../../../services/RequestTypes';
import {
	JobStatusData,
	SimulationInfo,
	StatusState,
	currentJobStatusData
} from '../../../services/ResponseTypes';
import { useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
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

	const {
		cancelJob,
		postJob: sendRun,
		getHelloWorld: sendHelloWorld,
		getPageContents: getSimulations,
		getPageStatus: getSimulationsStatus
	} = useShSimulation();
	const { enqueueSnackbar } = useSnackbar();

	const [isInProgress, setInProgress] = useState(false);
	const [isBackendAlive, setBackendAlive] = useState(false);
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);
	const [page, setPage] = useState(1);
	const [pageCount, setPageCount] = useState(0);
	const [orderType, setOrderType] = useState<OrderType>(OrderType.ASCEND);
	const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.START_TIME);
	const [pageSize, setPageSize] = useState(6);

	const [inputFiles, setInputFiles] = useState<InputFiles>();

	const [trackedId, setTrackedId] = useState<string>();
	const [simulationInfo, setSimulationInfo] = useState<SimulationInfo[]>([]);
	const [simulationsStatusData, setSimulationsStatusData] = useState<JobStatusData[]>([]);
	const [localSimulationData, setLocalSimulationData] = useState<JobStatusData[]>(
		localResultsSimulationData ?? []
	);

	const { resultsProvider, canLoadResultsData, clearLoadedResults } = useLoader();

	const [simulationIDInterval, setSimulationIDInterval] = useState<number | null>(null);

	const [controller] = useState(new AbortController());

	const updateSimulationInfo = useCallback(
		() =>
			getSimulations(page - 1, pageSize, orderType, orderBy)
				.then(results => {
					const { simulations, pageCount } = results;
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
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
			getSimulations(page - 1, pageSize, orderType, orderBy, signal)
				.then(({ simulations, pageCount }) => {
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(),
		[getSimulations]
	);
	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setPage(page);
		refreshPage(page, pageSize, orderType, orderBy, controller.signal);
	};

	const handleJobCancel = (simulationInfo: SimulationInfo) => {
		cancelJob(simulationInfo, controller.signal).then(() => {
			refreshPage(page, pageSize, orderType, orderBy, controller.signal);
		});
	};

	const handleOrderChange = (orderType: OrderType, orderBy: OrderBy, pageSize: number) => {
		setOrderType(orderType);
		setOrderBy(orderBy);
		setPageSize(pageSize);
		refreshPage(page, pageSize, orderType, orderBy, controller.signal);
	};

	const handleBeforeCacheWrite = useCallback(
		(id: string, response: JobStatusData) => {
			if (id === trackedId && currentJobStatusData[StatusState.COMPLETED](response))
				setResultsSimulationData(response);
		},
		[setResultsSimulationData, trackedId]
	);

	const updateSimulationData = useCallback(
		() =>
			!DEMO_MODE &&
			getSimulationsStatus(
				simulationInfo,
				true,
				handleBeforeCacheWrite,
				controller.signal
			).then(s => {
				setSimulationsStatusData([...s.reverse()]);
			}),
		[handleBeforeCacheWrite, controller.signal, getSimulationsStatus, simulationInfo]
	);

	const runSimulation = (inputFiles?: InputFiles) => {
		setInProgress(true);
		if (!editorRef.current && !inputFiles) return;
		const simData = inputFiles ? { inputFiles } : editorRef.current!.toJSON();
		sendRun(simData, undefined, undefined, undefined, controller.signal)
			.then(res => {
				updateSimulationInfo();
				setTrackedId(res.jobId);
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
			const anyResults = simulationsStatusData.find(
				s => currentJobStatusData[StatusState.COMPLETED](s) && s.inputJson?.hash === hash
			);
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
			clearLoadedResults();
			const newLocalData = resultsProvider.map(data => {
				const newData = {
					...data,
					jobState: StatusState.LOCAL
				};
				return currentJobStatusData[StatusState.LOCAL](newData) && newData;
			}) as JobStatusData<StatusState.LOCAL>[];
			setLocalSimulationData(newLocalData);
			setLocalResultsSimulationData(newLocalData);
		} else {
			setLocalSimulationData(localResultsSimulationData ?? []);
		}
	}, [
		canLoadResultsData,
		resultsProvider,
		clearLoadedResults,
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
					else
						currentJobStatusData[StatusState.COMPLETED](simulation) &&
							setResultsSimulationData(simulation);
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
