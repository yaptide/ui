import { ChangeEvent, useCallback, useMemo, useState } from 'react';

import { isFullSimulationData } from '../../../../services/LoaderService';
import { OrderBy, OrderType } from '../../../../types/RequestTypes';
import {
	currentJobStatusData,
	JobStatusData,
	SimulationInputFiles,
	StatusState
} from '../../../../types/ResponseTypes';
import { PageNavigationProps, PageParamProps } from '../SimulationPanelBar';
import {
	PageState,
	SimulationConfig,
	SimulationHandlers,
	SimulationState
} from './BackendSimulationsTypes';

const BackendSimulationsHelpers = (
	config: SimulationConfig,
	handlers: SimulationHandlers,
	state: SimulationState
) => {
	const { demoMode, controller, trackedId, isBackendAlive } = config;
	const { getPageContents, getPageStatus, getJobStatus, getFullSimulationData, cancelJob } =
		handlers;

	const {
		simulationInfo,
		simulationsStatusData,
		setSimulationInfo,
		setSimulationsStatusData,
		setResultsSimulationData,
		setLocalResultsSimulationData,
		goToResults,
		setInputFiles,
		setShowInputFilesEditor
	} = state;

	const [pageIdx, setPageIdx] = useState(1);
	const [pageCount, setPageCount] = useState(1);
	const [orderType, setOrderType] = useState<OrderType>(OrderType.DESCEND);
	const [orderBy, setOrderBy] = useState<OrderBy>(OrderBy.START_TIME);
	const [pageSize, setPageSize] = useState(6);

	const updateSimulationInfo = useCallback(
		() =>
			getPageContents(pageIdx, pageSize, orderType, orderBy)
				.then(results => {
					const { simulations, pageCount } = results;
					setSimulationInfo([...simulations]);
					setPageCount(pageCount);
				})
				.catch(),
		[getPageContents, orderType, orderBy, pageIdx, pageSize, setSimulationInfo, setPageCount]
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
	}, [
		demoMode,
		getPageStatus,
		simulationInfo,
		handleBeforeCacheWrite,
		controller.signal,
		setSimulationsStatusData
	]);

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
		[
			demoMode,
			simulationInfo,
			getJobStatus,
			handleBeforeCacheWrite,
			controller.signal,
			setSimulationsStatusData
		]
	);

	const simulationDataInterval = useMemo(() => {
		if (demoMode || !isBackendAlive) return undefined;

		const allSettled = simulationsStatusData?.every(
			s =>
				currentJobStatusData[StatusState.COMPLETED](s) ||
				currentJobStatusData[StatusState.FAILED](s) ||
				currentJobStatusData[StatusState.CANCELED](s)
		);

		if (allSettled) return 10000;

		return 1500;
	}, [demoMode, isBackendAlive, simulationsStatusData]);

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
		[
			pageIdx,
			pageSize,
			orderType,
			orderBy,
			getPageContents,
			controller.signal,
			setSimulationInfo
		]
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

	const filterSimulationsByJobId = useCallback(
		(jobId: string) => {
			return simulationsStatusData?.filter(s => s.jobId !== jobId);
		},
		[simulationsStatusData]
	);

	const deleteSpecificSimulation = useCallback(
		(jobId: string) => {
			const info = simulationInfo.find(s => s.jobId === jobId);
			const url = `user/simulations`;

			if (!info) {
				setLocalResultsSimulationData(prev => {
					if (!prev) return [];
					const index = prev.findIndex(s => s.jobId === jobId);
					prev.splice(index, 1);

					return [...prev];
				});
			} else {
				setSimulationsStatusData(filterSimulationsByJobId(jobId));
				info.endpointUrl = url;
				cancelJob(info, controller.signal).then(() => {
					refreshPage();
				});
			}
		},
		[
			simulationInfo,
			setLocalResultsSimulationData,
			setSimulationsStatusData,
			filterSimulationsByJobId,
			cancelJob,
			controller.signal,
			refreshPage
		]
	);

	const handlePageChange = (event: ChangeEvent<unknown>, pageIdx: number) =>
		autoRefreshPage({ pageIdx });

	const handleOrderChange = (orderType: OrderType, orderBy: OrderBy, pageSize: number) =>
		autoRefreshPage({ orderType, orderBy, pageSize });

	const pageData: PageParamProps & PageNavigationProps = {
		orderType,
		orderBy,
		pageCount,
		pageIdx,
		pageSize,
		handleOrderChange,
		handlePageChange
	};

	return {
		updateSimulationInfo,
		updateSimulationData,
		updateSpecificSimulationData,
		simulationDataInterval,
		handleLoadResults,
		handleShowInputFiles,
		setPageCount,
		cancelSpecificSimulation,
		deleteSpecificSimulation,
		pageData
	};
};

export default BackendSimulationsHelpers;
