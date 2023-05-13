import { ReactNode, useCallback, useRef } from 'react';
import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { FilterJSON } from '../ThreeEditor/util/Detect/DetectFilter';
import { ScoringManagerJSON } from '../ThreeEditor/util/Scoring/ScoringManager';
import {
	RequestCancelJob,
	RequestGetJobStatus,
	RequestGetPageContents,
	RequestGetPageStatus,
	RequestParam,
	RequestPostJob,
	RequestTopasConvert,
	isEditorJson
} from '../types/RequestTypes';
import {
	YaptideResponse,
	JobStatusData,
	ResponseGetJobStatus,
	ResponseGetPageContents,
	ResponsePostJob,
	ResponseTopasConvert,
	StatusState,
	currentJobStatusData
} from '../types/ResponseTypes';
import { camelToSnakeCase } from '../types/TypeTransformUtil';
import { orderAccordingToList } from '../util/Sort';
import { useAuth } from './AuthService';
import { createGenericContext } from './GenericContext';

export interface TopasSimulationProps {
	children: ReactNode;
}

export interface ITopasSimulation {
	postJobDirect: (...args: RequestPostJob) => Promise<ResponsePostJob>;
	postJobBatch: (...args: RequestPostJob) => Promise<ResponsePostJob>;
	cancelJobDirect: (...args: RequestCancelJob) => Promise<unknown>;
	cancelJobBatch: (...args: RequestCancelJob) => Promise<unknown>;
	convertToInputFiles: (...args: RequestTopasConvert) => Promise<ResponseTopasConvert>;
	getHelloWorld: (...args: RequestParam) => Promise<unknown>;
	getJobDirectStatus: (...args: RequestGetJobStatus) => Promise<JobStatusData | undefined>;
	getJobBatchStatus: (...args: RequestGetJobStatus) => Promise<JobStatusData | undefined>;
	getPageContents: (...args: RequestGetPageContents) => Promise<ResponseGetPageContents>;
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

export const recreateRefsInResults = (results: JobStatusData<StatusState.COMPLETED>) => {
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

const [useTopasSimulation, TopasSimulationContextProvider] = createGenericContext<ITopasSimulation>();

const TopasSimulation = ({ children }: TopasSimulationProps) => {
	const { authKy } = useAuth();

	const statusDataCache = useRef(new Map<string, JobStatusData>());

	const getHelloWorld = useCallback(
		(signal?: AbortSignal) =>
			authKy
				.get(``, { signal })
				.json<YaptideResponse>()
				.then(r => !!r.message),
		[authKy]
	);

	const postJob = useCallback(
		(endPoint: string) =>
			(...[simData, ntasks, simType, title, batchOptions, signal]: RequestPostJob) => {
				if (title === undefined && isEditorJson(simData)) title = simData.project.title;
				return authKy
					.post(endPoint, {
						json: {
							...camelToSnakeCase(
								{
									simData
								},
								false // converter expects camelCase for simData
							),
							...camelToSnakeCase(
								{
									ntasks,
									simType,
									title,
									batchOptions
								},
								true
							)
						},
						signal,
						timeout: 30000
						/**
						 * Timeout in milliseconds for getting a response. Can not be greater than 2147483647.
						 * If set to `false`, there will be no timeout.
						 * */
					})
					.json<ResponsePostJob>();
			},
		[authKy]
	);

	const convertToInputFiles = useCallback(
		(...[simData, signal]: RequestTopasConvert) =>
			authKy
				.post(`Topas/convert`, {
					signal,
					json: simData
				})
				.json<ResponseTopasConvert>(),
		[authKy]
	);

	const getJobStatus = useCallback(
		(endPoint: string) =>
			(...[info, cache = true, beforeCacheWrite, signal]: RequestGetJobStatus) => {
				const { jobId } = info;

				if (cache && statusDataCache.current.has(jobId))
					return Promise.resolve(statusDataCache.current.get(jobId));

				return authKy
					.get(endPoint, {
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
		(endPoint: string) =>
			(...[{ jobId }, signal]: RequestCancelJob) =>
				authKy
					.delete(endPoint, {
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
				infoList.map(info => {
					if (info.metadata.platform === undefined) {
						console.error('info.metadata.platform is undefined');
						return undefined;
					}
					const endPoint = `jobs/${info.metadata.platform.toLowerCase()}`;
					return getJobStatus(endPoint)(info, cache, beforeCacheWrite, signal);
				})
			).then(dataList => {
				return dataList.filter(data => data !== undefined) as JobStatusData[];
			});
		},
		[getJobStatus]
	);

	return (
		<TopasSimulationContextProvider
			value={{
				postJobDirect: postJob('jobs/direct'),
				postJobBatch: postJob('jobs/batch'),
				cancelJobDirect: cancelJob('jobs/direct'),
				cancelJobBatch: cancelJob('jobs/batch'),
				convertToInputFiles,
				getHelloWorld,
				getJobDirectStatus: getJobStatus('jobs/direct'),
				getJobBatchStatus: getJobStatus('jobs/batch'),
				getPageContents,
				getPageStatus
			}}>
			{children}
		</TopasSimulationContextProvider>
	);
};

export { TopasSimulation, useTopasSimulation };
