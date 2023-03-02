import { ReactNode, useCallback, useRef } from 'react';
import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { FilterJSON } from '../ThreeEditor/util/Detect/DetectFilter';
import { ScoringManagerJSON } from '../ThreeEditor/util/Scoring/ScoringManager';
import { createGenericContext } from '../util/GenericContext';
import { orderAccordingToList } from '../util/Sort';
import { useAuth } from './AuthService';
import { camelToSnakeCase } from './TypeTransformUtil';
import {
	RequestCancelJob,
	RequestGetJobStatus,
	RequestGetPageContents,
	RequestGetPageStatus,
	RequestParam,
	RequestPostJob,
	RequestShConvert,
	isEditorJson
} from './RequestTypes';
import {
	JobStatusData,
	Response,
	ResponseGetJobStatus,
	ResponseGetPageContents,
	ResponsePostJob,
	ResponseShConvert,
	SimulationsPage,
	StatusState,
	currentJobStatusData
} from './ResponseTypes';

export interface ShSimulationProps {
	children: ReactNode;
}

export interface IShSimulation {
	postJob: (...args: RequestPostJob) => Promise<ResponsePostJob>;
	cancelJob: (...args: RequestCancelJob) => Promise<unknown>;
	convertToInputFiles: (...args: RequestShConvert) => Promise<ResponseShConvert>;
	getHelloWorld: (...args: RequestParam) => Promise<unknown>;
	getJobStatus: (...args: RequestGetJobStatus) => Promise<JobStatusData | undefined>;
	getPageContents: (...args: RequestGetPageContents) => Promise<SimulationsPage>;
	getPageStatus: (...args: RequestGetPageStatus) => Promise<JobStatusData[]>;
}

const recreateOrderInEstimators = (
	estimators: Estimator[],
	scoringManagerJSON: ScoringManagerJSON
): Estimator[] => {
	return orderAccordingToList(
		estimators,
		scoringManagerJSON.scoringOutputs,
		'name',
		(e, o) => (e.scoringOutputJsonRef = o)
	);
};

const recreateRefToFilters = (estimators: Estimator[], FiltersJSON: FilterJSON[]): Estimator[] => {
	estimators.forEach(estimator => {
		const { pages, scoringOutputJsonRef } = estimator;
		pages.forEach((page, idx) => {
			const quantity = scoringOutputJsonRef?.quantities.active[idx];
			const filter = FiltersJSON.find(o => o.uuid === quantity?.filter);
			page.filterRef = filter;
			page.name = quantity?.name;
		});
	});
	return estimators;
};

export const recreateRefsInResults = (
	results: JobStatusData<StatusState.COMPLETED | StatusState.LOCAL>
) => {
	const { result, inputJson } = results;

	if (!inputJson) throw new Error('No editor data');
	if (!result) throw new Error('No result data');

	const { scoringManager, detectManager }: EditorJson = inputJson;

	result.estimators = recreateOrderInEstimators(result.estimators, scoringManager);
	result.estimators = recreateRefToFilters(result.estimators, detectManager?.filters);
};

const updateEstimators = (estimators: Estimator[]) => {
	for (const estimator of estimators) {
		estimator.name = estimator.name.replace(/_$/, '');
	}
};

const [useShSimulation, ShSimulationContextProvider] = createGenericContext<IShSimulation>();

const ShSimulation = ({ children }: ShSimulationProps) => {
	const { authKy } = useAuth();

	const statusDataCache = useRef(new Map<string, JobStatusData>());

	const getHelloWorld = useCallback(
		(signal?: AbortSignal) =>
			authKy
				.get(``, { signal })
				.json<Response>()
				.then(r => !!r.message),
		[authKy]
	);

	const postJob = useCallback(
		(...[simData, ntasks = 5, simType, title, batchOptions, signal]: RequestPostJob) => {
			if (title === undefined && isEditorJson(simData)) title = simData.project.title;

			return authKy
				.post(`jobs/direct`, {
					json: camelToSnakeCase({
						ntasks,
						simType,
						title,
						simData,
						batchOptions
					}),
					signal,
					timeout: 30000
					/**
					Timeout in milliseconds for getting a response. Can not be greater than 2147483647.
					If set to `false`, there will be no timeout.
					**/
				})
				.json<ResponsePostJob>();
		},
		[authKy]
	);

	const convertToInputFiles = useCallback(
		(...[simData, signal]: RequestShConvert) =>
			authKy
				.post(`sh/convert`, {
					signal,
					json: simData
				})
				.json<ResponseShConvert>(),
		[authKy]
	);

	const getJobStatus = useCallback(
		(...[info, cache = true, beforeCacheWrite, signal]: RequestGetJobStatus) => {
			const { jobId } = info;

			if (cache && statusDataCache.current.has(jobId))
				return Promise.resolve(statusDataCache.current.get(jobId));

			return authKy
				.get(`jobs/direct`, {
					signal,
					searchParams: camelToSnakeCase({ jobId })
				})
				.json<ResponseGetJobStatus>()
				.then(response => {
					const data: Partial<JobStatusData> = {
						...response,
						...info
					};
					if (currentJobStatusData[StatusState.PENDING](data)) {
					} else if (currentJobStatusData[StatusState.RUNNING](data)) {
					} else if (currentJobStatusData[StatusState.FAILED](data)) {
						console.log(data.error);

						beforeCacheWrite?.call(null, data.jobId, data);
						statusDataCache.current.set(data.jobId, data);
					} else if (currentJobStatusData[StatusState.COMPLETED](data)) {
						updateEstimators(data.result.estimators);
						if (data.inputJson) recreateRefsInResults(data);

						beforeCacheWrite?.call(null, data.jobId, data);
						statusDataCache.current.set(data.jobId, data);
					} else {
						return undefined;
					}
					return data;
				})
				.catch(() => undefined);
		},
		[authKy]
	);

	const cancelJob = useCallback(
		(...[{ jobId }, signal]: RequestCancelJob) =>
			authKy
				.delete(`jobs/direct`, {
					signal,
					searchParams: camelToSnakeCase({ jobId })
				})
				.then(() => {
					statusDataCache.current.delete(jobId);
				}),
		[authKy]
	);

	const getPageContents = useCallback(
		(...[pageIdx, pageSize, orderType, orderBy, signal]: RequestGetPageContents) =>
			authKy
				.get(`user/simulations`, {
					signal,
					searchParams: camelToSnakeCase({ pageIdx, pageSize, orderType, orderBy })
				})
				.json<ResponseGetPageContents>(),
		[authKy]
	);

	const getPageStatus = useCallback(
		(...[infoList, cache = true, beforeCacheWrite, signal]: RequestGetPageStatus) => {
			return Promise.all(
				infoList.map(info => getJobStatus(info, cache, beforeCacheWrite, signal))
			).then(values => [...values.filter((e): e is JobStatusData => e !== undefined)]);
		},
		[getJobStatus]
	);

	return (
		<ShSimulationContextProvider
			value={{
				postJob,
				cancelJob,
				convertToInputFiles,
				getHelloWorld,
				getJobStatus,
				getPageContents,
				getPageStatus
			}}>
			{children}
		</ShSimulationContextProvider>
	);
};

export { useShSimulation, ShSimulation };
