import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isFullSimulationData } from '../../../../services/LoaderService';
import { withStatus } from '../../../../services/useSimulationStatusStream';
import { OrderBy, OrderType } from '../../../../types/RequestTypes';
import {
	currentJobStatusData,
	JobStatusData,
	SimulationInfo,
	SimulationInputFiles,
	StatusState
} from '../../../../types/ResponseTypes';
import { FullSimulationData } from '../../../../types/SimulationService';
import { partialRevision } from '../../../../util/partialResults';
import { PageNavigationProps, PageParamProps } from '../SimulationPanelBar';
import {
	PageState,
	SimulationConfig,
	SimulationHandlers,
	SimulationState
} from './SimulationsGridTypes';

const FINAL_STATES = new Set([StatusState.COMPLETED, StatusState.FAILED, StatusState.CANCELED]);

const SimulationsGridHelpers = (
	config: SimulationConfig,
	handlers: SimulationHandlers,
	state: SimulationState
) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const currentJobId = useRef<string>('');
	const { controller, trackedId, isBackendAlive, statusStates } = config;
	const {
		getPageContents,
		getPageStatus,
		getJobStatus,
		getFullSimulationData,
		cancelJob,
		statusStream
	} = handlers;
	// read when a fetched status comes, so a status pushed meanwhile is not overwritten by an older one
	const streamed = useRef(statusStream?.statuses);
	streamed.current = statusStream?.statuses;

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
	const [pageSize, setPageSize] = useState(10);

	const updateSimulationInfo = useCallback(
		() =>
			getPageContents(pageIdx, pageSize, orderType, orderBy, statusStates)
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
			if (
				id === trackedId &&
				currentJobStatusData[StatusState.COMPLETED](response) &&
				!runFinishShown.has(id)
			) {
				runFinishShown.add(id);
				const fullData = await getFullSimulationData(response, controller.signal);
				setResultsSimulationData(
					fullData ? { source: 'onRunFinish', data: fullData } : undefined
				);
			}
		},
		[controller.signal, getFullSimulationData, setResultsSimulationData, trackedId]
	);

	const streamOpened = statusStream?.opened;
	const updateSimulationData = useCallback(
		() =>
			// a tab nobody looks at does not poll; the next tick after it is shown again catches up
			document.hidden && !statusStream?.live
				? Promise.resolve()
				: getPageStatus(
						simulationInfo,
						true,
						handleBeforeCacheWrite,
						controller.signal
					).then(s => {
						setSimulationsStatusData(
							(s ?? []).map(data => withStatus(data, streamed.current?.[data.jobId]))
						);
					}),
		// fetched again whenever the stream (re)opens: it sends only the simulations not finished by then
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			getPageStatus,
			simulationInfo,
			handleBeforeCacheWrite,
			controller.signal,
			setSimulationsStatusData,
			statusStream?.live,
			streamOpened
		]
	);

	const updateSpecificSimulationData = useCallback(
		async (jobId: string) => {
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
			simulationInfo,
			getJobStatus,
			handleBeforeCacheWrite,
			controller.signal,
			setSimulationsStatusData
		]
	);

	// pushed statuses in place of the held ones; a final one is fetched once, also to load the results of the
	// tracked simulation
	const fetchedFinal = useRef(new Set<string>());
	useEffect(() => {
		if (!statusStream) return;
		const { statuses } = statusStream;
		setSimulationsStatusData(prev => prev?.map(data => withStatus(data, statuses[data.jobId])));
		Object.values(statuses)
			.filter(
				status =>
					status.jobState &&
					FINAL_STATES.has(status.jobState) &&
					!fetchedFinal.current.has(status.jobId) &&
					simulationInfo.some(info => info.jobId === status.jobId)
			)
			.forEach(status => {
				fetchedFinal.current.add(status.jobId);
				updateSpecificSimulationData(status.jobId);
			});
	}, [statusStream, simulationInfo, setSimulationsStatusData, updateSpecificSimulationData]);

	const simulationDataInterval = useMemo(() => {
		// pushed by the server; polled only when the stream cannot be opened
		if (!isBackendAlive || statusStream?.live) return undefined;

		const allSettled = simulationsStatusData?.every(
			s =>
				currentJobStatusData[StatusState.COMPLETED](s) ||
				currentJobStatusData[StatusState.FAILED](s) ||
				currentJobStatusData[StatusState.CANCELED](s)
		);

		if (allSettled) return 10000;

		return 1500;
	}, [isBackendAlive, simulationsStatusData, statusStream?.live]);

	const handleLoadResults = async (
		taskId: string | null,
		simulation: FullSimulationData | SimulationInfo
	) => {
		if (taskId === null) return goToResults?.call(null);

		if (
			currentJobStatusData[StatusState.COMPLETED](simulation) ||
			partialRevision(simulation as JobStatusData) !== undefined
		) {
			const fullData = isFullSimulationData(simulation)
				? (simulation as unknown as FullSimulationData)
				: await getFullSimulationData(simulation, controller.signal);
			setResultsSimulationData(fullData ? { source: 'onSelect', data: fullData } : undefined);
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
			getPageContents(
				newPageIdx,
				newPageSize,
				newOrderType,
				newOrderBy,
				statusStates,
				controller.signal
			)
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

	const submitDelete = useCallback(() => {
		const jobId = currentJobId.current;
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
			setIsModalOpen(false);
			info.endpointUrl = url;
			setSimulationsStatusData(filterSimulationsByJobId(jobId));
			cancelJob(info, controller.signal).then(() => {
				refreshPage();
			});
		}
	}, [
		cancelJob,
		controller.signal,
		filterSimulationsByJobId,
		refreshPage,
		setLocalResultsSimulationData,
		setSimulationsStatusData,
		simulationInfo
	]);

	const deleteSpecificSimulation = (jobId: string) => {
		setIsModalOpen(true);
		currentJobId.current = jobId;
	};

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
		pageData,
		isModalOpen,
		setIsModalOpen,
		submitDelete
	};
};

// a finished run opens its results once: the grids see its final status again on every remount and stream reconnect
const runFinishShown = new Set<string>();

export default SimulationsGridHelpers;
