import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { isFullSimulationData } from '../../../services/LoaderService';
import { useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { OrderBy, OrderType } from '../../../types/RequestTypes';
import {
	currentJobStatusData,
	JobStatusData,
	SimulationInfo,
	SimulationInputFiles,
	StatusState
} from '../../../types/ResponseTypes';
import useIntervalAsync from '../../../util/hooks/useIntervalAsync';
import { PaginatedSimulationsFromBackend } from './SimulationCardGrid';
import { PageNavigationProps, PageParamProps } from './SimulationPanelBar';

interface BackendSimulationsProps {
	goToResults?: () => void;

	setInputFiles: (inputFiles: SimulationInputFiles | undefined) => void;
	setShowInputFilesEditor: (show: boolean) => void;
}

export const BackendSimulations = (props: BackendSimulationsProps) => {
	const { goToResults, setInputFiles, setShowInputFilesEditor } = props;

	const { demoMode } = useConfig();
	const {
		yaptideEditor,
		/** Queued Simulation Data */
		trackedId,
		setResultsSimulationData,
		setLocalResultsSimulationData
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

	/** Visibility Flags */
	const [isBackendAlive, setBackendAlive] = useState(false);

	const [pageIdx, setPageIdx] = useState(1);
	const [pageCount, setPageCount] = useState(1);
	const [orderType, setOrderType] = useState<OrderType>(OrderType.DESCEND);
	const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.START_TIME);
	const [pageSize, setPageSize] = useState(6);

	type PageState = Omit<
		PageParamProps & PageNavigationProps,
		'handlePageChange' | 'handleOrderChange'
	>;

	const [simulationInfo, setSimulationInfo] = useState<SimulationInfo[]>([]);
	const [simulationsStatusData, setSimulationsStatusData] = useState<JobStatusData[]>();

	const [controller] = useState(new AbortController());

	const updateSimulationInfo = useCallback(
		() =>
			getPageContents(pageIdx, pageSize, orderType, orderBy)
				.then(results => {
					const { simulations, pageCount } = results;
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(),
		[getPageContents, orderType, orderBy, pageIdx, pageSize]
	);

	const handleBeforeCacheWrite = useCallback(
		async (id: string, response: JobStatusData) => {
			if (id === trackedId && currentJobStatusData[StatusState.COMPLETED](response)) {
				const fullData = await getFullSimulationData(response, controller.signal);
				setResultsSimulationData(fullData);
			}
		},
		[controller.signal, getFullSimulationData, setResultsSimulationData, trackedId]
	);

	const updateSimulationData = useCallback(() => {
		if (demoMode) return Promise.resolve();

		return getPageStatus(simulationInfo, true, handleBeforeCacheWrite, controller.signal).then(
			s => {
				setSimulationsStatusData([...(s ?? [])]);
			}
		);
	}, [demoMode, getPageStatus, simulationInfo, handleBeforeCacheWrite, controller.signal]);

	const updateSpecificSimulationData = useCallback(
		(jobId: string) => {
			if (demoMode) return Promise.resolve();
			const info = simulationInfo.find(s => s.jobId === jobId);

			if (!info) return Promise.resolve();

			return getJobStatus(info, false, handleBeforeCacheWrite, controller.signal).then(s => {
				s &&
					setSimulationsStatusData(prev => {
						if (!prev) return [s];
						const index = prev.findIndex(s => s.jobId === jobId);
						prev[index] = s;

						return [...prev];
					});
			});
		},
		[demoMode, simulationInfo, getJobStatus, handleBeforeCacheWrite, controller.signal]
	);

	useEffect(() => {
		if (!demoMode)
			getHelloWorld(controller.signal)
				.then(() => {
					setBackendAlive(true);
					updateSimulationInfo();
				})
				.catch(() => {
					setBackendAlive(false);
					setPageCount(0);
				});

		return () => {
			controller.abort();
		};
	}, [
		controller.signal,
		getHelloWorld,
		updateSimulationInfo,
		isBackendAlive,
		setBackendAlive,
		demoMode,
		trackedId,
		controller
	]);

	const simulationDataInterval = useMemo(() => {
		if (demoMode || !isBackendAlive) return undefined;

		const allSettled = simulationsStatusData?.every(
			s =>
				currentJobStatusData[StatusState.COMPLETED](s) ||
				currentJobStatusData[StatusState.FAILED](s) ||
				currentJobStatusData[StatusState.CANCELED](s)
		);

		if (allSettled) return 10000;

		// interval 1.5 second if there are simulations to track and there is connection to backend
		return 1500;
	}, [demoMode, isBackendAlive, simulationsStatusData]);

	useIntervalAsync(updateSimulationData, simulationDataInterval, simulationInfo.length > 0);

	const handleLoadResults = async (taskId: string | null, simulation: unknown) => {
		if (taskId === null) return goToResults?.call(null);

		if (currentJobStatusData[StatusState.COMPLETED](simulation)) {
			const fullData = isFullSimulationData(simulation)
				? simulation
				: await getFullSimulationData(simulation, controller.signal);
			setResultsSimulationData(fullData);
		}
	};

	const handleShowInputFiles = (inputFiles?: SimulationInputFiles) => {
		setShowInputFilesEditor(true);
		setInputFiles(inputFiles);
	};

	useEffect(() => {
		const updateCurrentSimulation = async () => {
			if (!demoMode && yaptideEditor) {
				const hash = yaptideEditor.toJSON().hash;
				const currentStatus = simulationsStatusData?.find(async s => {
					if (currentJobStatusData[StatusState.COMPLETED](s)) {
						const jobInputs = await getJobInputs(s, controller.signal);

						return jobInputs?.input.inputJson?.hash === hash;
					}

					return false;
				});

				const currentSimulation = currentStatus
					? await getFullSimulationData(currentStatus, controller.signal)
					: undefined;

				if (currentSimulation) yaptideEditor.setResults(currentSimulation);
				else yaptideEditor.setResults(null);
			}
		};
		updateCurrentSimulation();
	}, [
		simulationsStatusData,
		yaptideEditor,
		getJobInputs,
		controller.signal,
		getFullSimulationData,
		demoMode
	]);

	useEffect(() => {
		return () => {
			controller.abort();
		};
	}, [controller]);

	const refreshPage = useCallback(
		(
			newPageIdx: number = pageIdx,
			newPageSize: number = pageSize,
			newOrderType: OrderType = orderType,
			newOrderBy: OrderBy = orderBy
		) =>
			getPageContents(newPageIdx, newPageSize, newOrderType, newOrderBy, controller.signal)
				.then(({ simulations, pageCount }) => {
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(e => console.error(e)),
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

	const cancelSpecificSimulation = useCallback(
		(jobId: string) => {
			const info = simulationInfo.find(s => s.jobId === jobId);

			if (!info) {
				setLocalResultsSimulationData(prev => {
					if (!prev) return [];
					const index = prev.findIndex(s => s.jobId === jobId);
					prev.splice(index, 1);

					return [...prev];
				});
			} else {
				cancelJob(info, controller.signal).then(() => {
					refreshPage();
				});
			}
		},
		[simulationInfo, setLocalResultsSimulationData, cancelJob, controller.signal, refreshPage]
	);

	const handlePageChange = (event: ChangeEvent<unknown>, pageIdx: number) =>
		autoRefreshPage({ pageIdx });

	const handleOrderChange = (orderType: OrderType, orderBy: OrderBy, pageSize: number) =>
		autoRefreshPage({ orderType, orderBy, pageSize });

	return (
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
			handleRefresh={updateSpecificSimulationData}
			handleDelete={cancelSpecificSimulation}
			handleShowInputFiles={handleShowInputFiles}
			isBackendAlive={isBackendAlive}
		/>
	);
};
