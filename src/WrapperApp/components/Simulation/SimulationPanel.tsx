import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Fade,
	LinearProgress,
	Modal,
	Switch,
	Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import useInterval from 'use-interval';
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
import { DemoCardGrid, PaginatedSimulationsFromBackend } from './SimulationCardGrid';
import {
	BatchOptionsType,
	RunSimulationForm,
	SimulationRunType,
	SimulationSourceType
} from './RunSimulationForm';
import { EditorJson } from '../../../ThreeEditor/js/EditorJson';

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
		cancelJobDirect,
		postJobDirect,
		postJobBatch,
		getHelloWorld,
		getPageContents,
		getPageStatus
	} = useShSimulation();
	const { enqueueSnackbar } = useSnackbar();

	const [isInProgress, setInProgress] = useState(false);
	const [isBackendAlive, setBackendAlive] = useState(false);
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);
	const [showRunSimulationsForm, setShowRunSimulationsForm] = useState(false);
	const [page, setPage] = useState(1);
	const [pageCount, setPageCount] = useState(3);
	const [orderType, setOrderType] = useState<OrderType>(OrderType.ASCEND);
	const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.START_TIME);
	const [pageSize, setPageSize] = useState(6);

	const [simName, setSimName] = useState<string>(editorRef.current!.toJSON().project.title);
	const [nTasks, setNTasks] = useState<number>(1);
	const [availableClusters] = useState<string[]>(['default']);
	const [simulator] = useState<string>('shieldhit');

	const [inputFiles, setInputFiles] = useState<InputFiles>();
	const [directRun, setDirectRun] = useState<boolean>(true);

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
			getPageContents(page - 1, pageSize, orderType, orderBy)
				.then(results => {
					const { simulations, pageCount } = results;
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(),
		[getPageContents, orderType, orderBy, page, pageSize]
	);
	const refreshPage = useCallback(
		(
			page: number,
			pageSize: number,
			orderType: OrderType,
			orderBy: OrderBy,
			signal?: AbortSignal | undefined
		) =>
			getPageContents(page - 1, pageSize, orderType, orderBy, signal)
				.then(({ simulations, pageCount }) => {
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(),
		[getPageContents]
	);
	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setPage(page);
		refreshPage(page, pageSize, orderType, orderBy, controller.signal);
	};
	// will be used later
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleJobCancel = (simulationInfo: SimulationInfo) => {
		cancelJobDirect(simulationInfo, controller.signal).then(() => {
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
			getPageStatus(simulationInfo, true, handleBeforeCacheWrite, controller.signal).then(
				s => {
					setSimulationsStatusData([...s.reverse()]);
				}
			),
		[handleBeforeCacheWrite, controller.signal, getPageStatus, simulationInfo]
	);

	const runSimulation = (inputFiles?: InputFiles) => {
		setInProgress(true);
		if (!editorRef.current && !inputFiles) return;
		const simData = inputFiles ?? editorRef.current!.toJSON();
		console.log(directRun);

		(directRun ? postJobDirect : postJobBatch)(
			simData,
			nTasks,
			simulator,
			simName,
			undefined,
			controller.signal
		)
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
	const runTotalSimulation = (
		editorJson: EditorJson,
		inputFiles: Partial<InputFiles>,
		runType: SimulationRunType,
		sourceType: SimulationSourceType,
		simName: string,
		nTasks: number,
		simulator: string,
		batchOptions: BatchOptionsType
	) => {
		setShowRunSimulationsForm(false);
		setInProgress(true);
		const simData = sourceType === 'project' ? editorJson : inputFiles;
		const options =
			runType === 'batch'
				? {
						...batchOptions,
						cluster: undefined,
						arrayOptions: batchOptions.arrayOptions?.reduce((acc, curr) => {
							acc[curr.optionKey] = curr.optionValue;
							return acc;
						}, {} as Record<string, string>),
						collectOptions: batchOptions.collectOptions?.reduce((acc, curr) => {
							acc[curr.optionKey] = curr.optionValue;
							return acc;
						}, {} as Record<string, string>)
				  }
				: undefined;
		(runType === 'direct' ? postJobDirect : postJobBatch)(
			simData,
			nTasks,
			simulator,
			simName,
			options,
			controller.signal
		);
	};

	const onClickRun = () => {
		setShowRunSimulationsForm(false);
		runSimulation();
	};

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
			getHelloWorld(controller.signal)
				.then(() => {
					setBackendAlive(true);
					updateSimulationInfo();
					setSimulationIDInterval(10000);
				})
				.catch(() => {
					setBackendAlive(false);
					setPageCount(0);
				});
	}, [
		controller.signal,
		getHelloWorld,
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
					localData: true
				};
				return newData;
			});
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
				width: 'min(1600px, 100%)',
				maxWidth: 'max(75%,966px)',
				height: '100%',
				boxSizing: 'border-box',
				padding: ({ spacing }) => spacing(2, 5),
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem',
				scrollPadding: ({ spacing }) => spacing(2)
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
			{editorRef.current && (
				<Modal
					keepMounted
					open={isBackendAlive && showRunSimulationsForm}
					onClose={() => setShowRunSimulationsForm(false)}
					sx={{
						display: 'flex',
						alignItems: 'flex-start',
						mt: '15vh',
						justifyContent: 'center'
					}}>
					<Fade in={showRunSimulationsForm}>
						<Card sx={{ maxWidth: '660px' }}>
							<CardContent
								sx={{
									display: 'flex',
									gap: 3
								}}>
								<RunSimulationForm
									availableClusters={availableClusters}
									editorJson={editorRef.current.toJSON()}
									inputFiles={{
										'beam.dat': '',
										'detect.dat': '',
										'geo.dat': '',
										...inputFiles
									}}
									runSimulation={runTotalSimulation}
								/>
							</CardContent>
						</Card>
					</Fade>
				</Modal>
			)}
			<DemoCardGrid simulations={localSimulationData} title='Local Simulation Results' />
			<PaginatedSimulationsFromBackend
				simulations={simulationsStatusData}
				subtitle={'Yaptide backend server'}
				pageData={{
					orderType,
					orderBy,
					pageCount,
					page,
					pageSize,
					handleOrderChange,
					handlePageChange
				}}
				isBackendAlive={isBackendAlive}
				runSimulation={(): void => {
					setShowRunSimulationsForm(true);
				}}
			/>
		</Box>
	);
}
