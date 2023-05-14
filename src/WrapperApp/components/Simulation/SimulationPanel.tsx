import { Box, Card, CardContent, Fade, Modal } from '@mui/material';
import { useSnackbar } from 'notistack';

import { useCallback, useEffect, useState } from 'react';
import useInterval from 'use-interval';
import { EditorJson } from '../../../ThreeEditor/js/EditorJson';
import { useLoader } from '../../../services/DataLoaderService';
import { OrderBy, OrderType, SimulatorType } from '../../../types/RequestTypes';
import {
	SimulationInputFiles,
	JobStatusData,
	SimulationInfo,
	StatusState,
	currentJobStatusData
} from '../../../types/ResponseTypes';
import { useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { DEMO_MODE } from '../../../config/Config';
import { InputFilesEditor } from '../InputEditor/InputFilesEditor';
import {
	BatchOptionsType,
	RunSimulationForm,
	SimulationRunType,
	SimulationSourceType
} from './RunSimulationForm';
import { DemoCardGrid, PaginatedSimulationsFromBackend } from './SimulationCardGrid';
import { PageNavigationProps, PageParamProps } from './SimulationPanelBar';
import EXAMPLES from '../../../ThreeEditor/examples/examples';

interface SimulationPanelProps {
	goToResults?: () => void;
	forwardedInputFiles?: SimulationInputFiles;
}

export default function SimulationPanel({
	goToResults,
	forwardedInputFiles
}: SimulationPanelProps) {
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
	const { resultsProvider, canLoadResultsData, clearLoadedResults } = useLoader();

	/** Visibility Flags */
	const [isBackendAlive, setBackendAlive] = useState(false);
	const [showInputFilesEditor, setShowInputFilesEditor] = useState(false);
	const [showRunSimulationsForm, setShowRunSimulationsForm] = useState(!!forwardedInputFiles);

	const [pageIdx, setPageIdx] = useState(0);
	const [pageCount, setPageCount] = useState(0);
	const [orderType, setOrderType] = useState<OrderType>(OrderType.ASCEND);
	const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.START_TIME);
	const [pageSize, setPageSize] = useState(6);
	type PageState = Omit<
		PageParamProps & PageNavigationProps,
		'handlePageChange' | 'handleOrderChange'
	>;

	/** Simulation Run Options */
	const [availableClusters] = useState<string[]>(['default']);
	const [inputFiles, setInputFiles] = useState(forwardedInputFiles);

	/** Queued Simulation Data */
	const [trackedId, setTrackedId] = useState<string>();
	const [simulationInfo, setSimulationInfo] = useState<SimulationInfo[]>([]);
	const [simulationsStatusData, setSimulationsStatusData] = useState<JobStatusData[]>([]);
	const [localSimulationData, setLocalSimulationData] = useState<JobStatusData[]>(
		localResultsSimulationData ?? []
	);

	const [simulationIDInterval, setSimulationIDInterval] = useState<number | null>(null);
	const [controller] = useState(new AbortController());

	const updateSimulationInfo = useCallback(
		() =>
			getPageContents(pageIdx - 1, pageSize, orderType, orderBy)
				.then(results => {
					const { simulations, pageCount } = results;
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(),
		[getPageContents, orderType, orderBy, pageIdx, pageSize]
	);

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

	const handleLoadResults = (taskId: string | null, simulation: unknown) => {
		if (taskId === null) goToResults?.call(null);
		else
			currentJobStatusData[StatusState.COMPLETED](simulation) &&
				setResultsSimulationData(simulation);
	};

	const handleShowInputFiles = (inputFiles?: SimulationInputFiles) => {
		setShowInputFilesEditor(true);
		setInputFiles(inputFiles);
	};

	/**
	 * @deprecated
	 */ // eslint-disable-next-line @typescript-eslint/no-unused-vars
	const runSimulation = (
		inputFiles?: SimulationInputFiles,
		directRun: boolean = true,
		nTasks: number = 1,
		simulator: string = 'shieldhit',
		simName: string = 'Unrecognized Simulation Request'
	) => {
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
			});
	};

	const sendSimulationRequest = (
		editorJson: EditorJson,
		inputFiles: Partial<SimulationInputFiles>,
		runType: SimulationRunType,
		sourceType: SimulationSourceType,
		simName: string,
		nTasks: number,
		simulator: string,
		batchOptions: BatchOptionsType
	) => {
		setShowRunSimulationsForm(false);
		const simData = sourceType === 'project' ? editorJson : inputFiles;

		const options =
			runType === 'batch'
				? {
						...batchOptions,
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
		)
			.then(res => {
				updateSimulationInfo();
				setTrackedId(res.jobId);
			})
			.catch(e => {
				enqueueSnackbar('Error while starting simulation', { variant: 'error' });
				console.error(e);
			});
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

	const refreshPage = useCallback(
		(
			newPageIdx: number = pageIdx,
			newPageSize: number = pageSize,
			newOrderType: OrderType = orderType,
			newOrderBy: OrderBy = orderBy
		) =>
			getPageContents(
				newPageIdx - 1,
				newPageSize,
				newOrderType,
				newOrderBy,
				controller.signal
			)
				.then(({ simulations, pageCount }) => {
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(),
		[getPageContents, pageIdx, pageSize, orderType, orderBy, controller.signal]
	);

	const autoRefreshPage = useCallback(
		(pageState: Partial<PageState> = {}) => {
			const stateToSetter: Record<keyof PageState, Function> = {
				pageIdx: setPageIdx,
				pageSize: setPageSize,
				orderType: setOrderType,
				orderBy: setOrderBy,
				pageCount: setPageCount
			};
			Object.entries(pageState).forEach(([key, value]) =>
				stateToSetter[key as keyof PageState](value)
			);
			const { pageIdx, pageSize, orderType, orderBy } = pageState;
			refreshPage(pageIdx, pageSize, orderType, orderBy);
		},
		[refreshPage]
	);

	// will be used later
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleJobCancel = (simulationInfo: SimulationInfo) => {
		cancelJobDirect(simulationInfo, controller.signal).finally(autoRefreshPage);
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, pageIdx: number) =>
		autoRefreshPage({ pageIdx });

	const handleOrderChange = (orderType: OrderType, orderBy: OrderBy, pageSize: number) =>
		autoRefreshPage({ orderType, orderBy, pageSize });

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(1600px, 100%)',
				maxWidth: 'max(75%, 966px)',
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
				onClose={() => setShowInputFilesEditor(false)}
				closeAfterTransition>
				<Fade in={showInputFilesEditor}>
					<Box sx={{ height: '100vh', width: '100vw', overflow: 'auto' }}>
						<InputFilesEditor
							simulator={SimulatorType.SHIELDHIT}
							inputFiles={inputFiles}
							closeEditor={() => setShowInputFilesEditor(false)}
							onChange={newInputFiles => setInputFiles(newInputFiles)}
							runSimulation={newInputFiles => {
								setShowInputFilesEditor(false);
								setInputFiles(newInputFiles);
								setShowRunSimulationsForm(true);
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
										...inputFiles
									}}
									runSimulation={sendSimulationRequest}
								/>
							</CardContent>
						</Card>
					</Fade>
				</Modal>
			)}
			<DemoCardGrid
				simulations={localSimulationData}
				title='Local Simulation Results'
				handleLoadResults={handleLoadResults}
				handleShowInputFiles={handleShowInputFiles}
			/>
			{DEMO_MODE ? (
				<DemoCardGrid
					simulations={EXAMPLES}
					title='Demo Simulation Results'
					handleLoadResults={handleLoadResults}
					handleShowInputFiles={handleShowInputFiles}
				/>
			) : (
				<PaginatedSimulationsFromBackend
					simulations={simulationsStatusData}
					subtitle={'Yaptide backend server'}
					pageData={{
						orderType,
						orderBy,
						pageCount,
						pageIdx,
						pageSize,
						handleOrderChange,
						handlePageChange
					}}
					handleLoadResults={handleLoadResults}
					handleShowInputFiles={handleShowInputFiles}
					isBackendAlive={isBackendAlive}
					runSimulation={() => {
						setShowRunSimulationsForm(true);
					}}
				/>
			)}
		</Box>
	);
}
