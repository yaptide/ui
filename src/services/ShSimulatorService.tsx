import { useCallback } from 'react';

import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { addCustomStoppingPowerTableToEditorJSON } from '../ThreeEditor/Simulation/CustomStoppingPower/CustomStoppingPower';
import { FilterJSON } from '../ThreeEditor/Simulation/Scoring/ScoringFilter';
import { ScoringManagerJSON } from '../ThreeEditor/Simulation/Scoring/ScoringManager';
import {
	isEditorJson,
	RequestCancelJob,
	RequestGetJobInputs,
	RequestGetJobLogs,
	RequestGetJobResult,
	RequestGetJobResults,
	RequestGetJobStatus,
	RequestGetPageContents,
	RequestGetPageStatus,
	RequestParam,
	RequestPostJob
} from '../types/RequestTypes';
import {
	currentJobStatusData,
	currentTaskStatusData,
	EstimatorItem,
	EstimatorPagesByDimensions,
	EstimatorsItemResponse,
	JobStatusCompleted,
	JobStatusData,
	JobStatusFailed,
	PageDimension,
	PlatformType,
	ResponseGetEstimatorPageResult,
	ResponseGetJobInputs,
	ResponseGetJobLogs,
	ResponseGetJobResults,
	ResponseGetJobStatus,
	ResponseGetPageContents,
	ResponsePostJob,
	SimulationInfo,
	StatusState,
	YaptideResponse
} from '../types/ResponseTypes';
import { useCacheMap } from '../util/hooks/useCacheMap';
import { camelToSnakeCase } from '../util/Notation/Notation';
import { ValidateShape } from '../util/Types';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';
import { useAuth } from './AuthService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';

export type JobLogs = {
	jobId: string;
} & ResponseGetJobLogs;

export type JobInputs = {
	jobId: string;
} & ResponseGetJobInputs;

export type JobResults = {
	jobId: string;
} & ResponseGetJobResults;

export type SpecificEstimator = {
	jobId: string;
	estimators: Estimator[];
	message: string;
};

export type FullSimulationData = Omit<JobInputs & JobStatusData & JobResults, 'message'>;

export const fetchItSymbol = Symbol('fetchItSymbol');

export interface RestSimulationContext {
	postJobDirect: (...args: RequestPostJob) => Promise<ResponsePostJob>;
	postJobBatch: (...args: RequestPostJob) => Promise<ResponsePostJob>;
	cancelJob: (...args: RequestCancelJob) => Promise<unknown>;
	getHelloWorld: (...args: RequestParam) => Promise<unknown>;
	getJobStatus: (...args: RequestGetJobStatus) => Promise<JobStatusData | undefined>;
	getJobInputs: (...args: RequestGetJobInputs) => Promise<JobInputs | undefined>;
	getJobResults: (...args: RequestGetJobResults) => Promise<JobResults | undefined>;
	getEstimatorsPages: (...args: RequestGetJobResult) => Promise<JobResults | undefined>;
	getJobLogs: (...args: RequestGetJobLogs) => Promise<JobLogs | undefined>;
	getPageContents: (...args: RequestGetPageContents) => Promise<ResponseGetPageContents>;
	getPageStatus: (...args: RequestGetPageStatus) => Promise<JobStatusData[] | undefined>;
	getFullSimulationData: (
		jobStatus: JobStatusData,
		signal?: AbortSignal,
		cache?: boolean,
		givenEstimatorName?: string
	) => Promise<FullSimulationData | undefined>;
}

/**
 * Rebuilds the references between estimators and their corresponding scoring manager outputs.
 * Each estimator is linked to an output in the scoring manager JSON by matching array indices.
 * The scoringManagerJSON.outputs array length should match the number of estimators - if there are
 * fewer outputs than estimators, the extra estimators will have undefined scoringOutputJsonRef.
 * If there are more outputs than estimators, the extra outputs will be ignored.
 *
 * @param estimators - Array of estimators that need scoring manager output references rebuilt
 * @param scoringManagerJSON - The scoring manager JSON containing output definitions. The outputs array
 *                            should ideally have the same length as the estimators array to ensure
 *                            all estimators get valid output references.
 * @returns The estimators array with updated scoring output references for each estimator
 */
const recreateRefToScoringManagerOutputs = (
	estimators: Estimator[],
	scoringManagerJSON: ScoringManagerJSON
): Estimator[] => {
	// Iterate through each estimator and set the scoringOutputJsonRef to the corresponding output in scoringManagerJSON
	estimators.forEach((estimator, index) => {
		estimator.scoringOutputJsonRef = scoringManagerJSON.outputs[index];
	});

	return estimators;
};

/**
 * Recreates references between estimators, their pages and filters by linking filter UUIDs with actual filter objects.
 * This rebuilds the relationships between estimator pages and their associated filters from the Filter JSON.
 *
 * @param estimators - Array of estimators containing pages that need filter references rebuilt
 * @param FiltersJSON - Array of filter objects that contain the actual filter definitions
 * @returns The estimators array with updated filter references for each page
 */
const recreateRefToFilters = (estimators: Estimator[], FiltersJSON: FilterJSON[]): Estimator[] => {
	// Iterate through each estimator and set the filterRef and name for each page
	estimators.forEach((estimator, estimatorIndex) => {
		const { pages, scoringOutputJsonRef } = estimator;
		pages.forEach((page, idx) => {
			const quantity = scoringOutputJsonRef?.quantities[idx];
			const filter = FiltersJSON.find(o => o.uuid === quantity?.filter);
			page.filterRef = filter;
			page.name = quantity?.name;
		});
	});

	return estimators;
};

/**
 * Recreates references in simulation results by linking estimator data with scoring manager outputs and filters
 * from the editor JSON. This function expects specific array length relationships to work properly:
 *
 * 1. The scoringManager.outputs array length should match the number of estimators, otherwise:
 *    - If fewer outputs than estimators: excess estimators will have undefined scoringOutputJsonRef
 *    - If more outputs than estimators: extra outputs are ignored
 * 2. Within each estimator, the number of pages should match the number of quantities in the
 *    corresponding scoring manager output for proper filter assignment
 *
 * @param inputJson - The editor JSON containing simulation configuration and scoring manager data
 * @param estimators - Array of estimators containing simulation results
 * @returns Estimators with updated references to scoring manager outputs and filters
 * @throws Error if inputJson or estimators are undefined
 */
export const recreateRefsInResults = (inputJson: EditorJson, estimators: Estimator[]) => {
	if (!inputJson) {
		console.error('No editor data provided to recreateRefsInResults');

		throw new Error('No editor data');
	}

	if (!estimators) {
		console.error('No estimators data provided to recreateRefsInResults');

		throw new Error('No estimators data');
	}

	const { scoringManager }: EditorJson = inputJson;
	const estimatorsWithScoringManagerOutputs = recreateRefToScoringManagerOutputs(
		estimators,
		scoringManager
	);

	const estimatorsWithFixedFilters = recreateRefToFilters(
		estimatorsWithScoringManagerOutputs,
		scoringManager.filters
	);

	return estimatorsWithFixedFilters;
};

const updateEstimators = (estimators: Estimator[]) => {
	for (const estimator of estimators) {
		estimator.name = estimator.name.replace(/_$/, '');
	}
};

const [useShSimulation, ShSimulationContextProvider] =
	createGenericContext<RestSimulationContext>();

const ShSimulation = ({ children }: GenericContextProviderProps) => {
	const { authKy } = useAuth();

	const statusDataCache = useCacheMap<JobStatusData>();
	const inputsCache = useCacheMap<JobInputs>();
	const resultsCache = useCacheMap<JobResults>();
	const logsCache = useCacheMap<JobLogs>();

	const getHelloWorld = useCallback(
		(signal?: AbortSignal) =>
			authKy
				.get(``, { signal })
				.json<YaptideResponse>()
				.then(r => !!r.message),
		[authKy]
	);

	/**
	 * Returns the endpoint based on the simulation info.
	 * If the platform is not known, it will return 'jobs/direct'.
	 * The platform name is stored in metadata of the simulation info and is typed by `PlatformType`.
	 * Endpoints are named after the platform types.
	 * @see PlatformType
	 * @param info - The simulation info object.
	 * @returns The endpoint string.
	 */
	const getEndpointFromSimulationInfo = (info: SimulationInfo) => {
		const platform =
			`jobs/${info.metadata.platform.toLowerCase()}` as `jobs/${Lowercase<PlatformType>}`;

		if (['jobs/direct', 'jobs/batch'].includes(platform)) return platform;
		console.error(`Simulation platform is unknown: ${info.metadata.platform}`);

		return 'jobs';
	};

	const postJob = useCallback(
		(endPoint: string) =>
			async (
				...[
					simData,
					inputType,
					ntasks,
					simType,
					title,
					batchOptions,
					signal
				]: RequestPostJob
			) => {
				if (title === undefined && isEditorJson(simData)) title = simData.project.title;
				const mapType: { [k in SimulationSourceType]: string } = {
					editor: 'json',
					files: 'files'
				};

				if (inputType === 'editor' && isEditorJson(simData)) {
					await addCustomStoppingPowerTableToEditorJSON(simData);
				}

				const filedName = mapType[inputType];

				if (filedName === undefined) throw new Error('Invalid input type ' + inputType);

				return authKy
					.post(endPoint, {
						json: {
							[`input_${filedName}`]: simData,
							...camelToSnakeCase(
								{
									inputType,
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

	const getJobInputs = useCallback(
		async (...[info, signal, cache = true, beforeCacheWrite]: RequestGetJobInputs) => {
			const { jobId } = info;

			if (cache && inputsCache.has(jobId)) return Promise.resolve(inputsCache.get(jobId));

			const cachePromise = inputsCache.createPromise(
				async resolve => {
					const response = await authKy
						.get('inputs', {
							signal,
							searchParams: camelToSnakeCase({ jobId })
						})
						.json<ResponseGetJobInputs>();

					const data: JobInputs = {
						...response,
						jobId
					};
					resolve(data);
				},
				jobId,
				beforeCacheWrite
			);

			return await cachePromise;
		},
		[authKy, inputsCache]
	);

	const getJobLogs = useCallback(
		async (...[info, signal, cache = true, beforeCacheWrite]: RequestGetJobLogs) => {
			const { jobId } = info;

			if (cache && logsCache.has(jobId)) return Promise.resolve(logsCache.get(jobId));

			const cachePromise = logsCache.createPromise(
				async resolve => {
					const response = await authKy
						.get('logfiles', {
							signal,
							searchParams: camelToSnakeCase({ jobId })
						})
						.json<ResponseGetJobLogs>();

					const data: JobLogs = {
						...response,
						jobId
					};
					resolve(data);
				},
				jobId,
				beforeCacheWrite
			);

			return await cachePromise;
		},
		[authKy, logsCache]
	);

	const getJobResults = useCallback(
		async (...[info, signal, cache = true, beforeCacheWrite]: RequestGetJobResults) => {
			const { jobId } = info;

			if (cache && resultsCache.has(jobId)) return Promise.resolve(resultsCache.get(jobId));

			const cachePromise = resultsCache.createPromise(
				async resolve => {
					const response = await authKy
						.get('results', {
							signal,
							searchParams: camelToSnakeCase({ jobId })
						})
						.json<ResponseGetJobResults>();

					updateEstimators(response.estimators);

					const jobInputs = await getJobInputs(info, signal, cache);

					const refsInResults =
						jobInputs?.input.inputJson &&
						recreateRefsInResults(jobInputs.input.inputJson, response.estimators);

					const data: JobResults = {
						...response,
						jobId,
						estimators: refsInResults ?? response.estimators
					};

					resolve(data);
				},
				jobId,
				beforeCacheWrite
			);

			return await cachePromise;
		},
		[authKy, getJobInputs, resultsCache]
	);

	const preparePageNumbers = (pageNumbers: number[]): string => {
		if (pageNumbers.length === 0) return '';

		const ranges: string[] = [];
		let start = pageNumbers[0];
		let end = pageNumbers[0];

		for (let i = 1; i < pageNumbers.length; i++) {
			if (pageNumbers[i] === end + 1) {
				end = pageNumbers[i];
			} else {
				ranges.push(start === end ? `${start}` : `${start}-${end}`);
				start = pageNumbers[i];
				end = pageNumbers[i];
			}
		}

		ranges.push(start === end ? `${start}` : `${start}-${end}`);

		return ranges.join(',');
	};

	const getEstimatorsPages = useCallback(
		async (...[info, signal, cache = true, beforeCacheWrite]: RequestGetJobResult) => {
			const { jobId, estimatorName, pageNumbers } = info;

			const searchParams = new URLSearchParams({
				job_id: jobId,
				estimator_name: estimatorName,
				page_numbers: preparePageNumbers(pageNumbers)
			});

			const cacheKey = `${jobId}-${estimatorName}-${pageNumbers.join(',')}`;

			if (cache && resultsCache.has(cacheKey)) {
				const data: Promise<JobResults> | JobResults | undefined =
					resultsCache.get(cacheKey);

				if (data instanceof Promise) {
					return data.then(resolvedData => {
						const estimators = resolvedData.estimators;
						const estimatorExists = estimators.some(
							estimator => estimator.name === estimatorName
						);

						if (estimatorExists) return Promise.resolve(resolvedData);
					});
				} else if (data) {
					const estimators = data.estimators;
					const estimatorExists = estimators.some(
						estimator => estimator.name === estimatorName
					);

					if (estimatorExists) return Promise.resolve(data);
				}
			}

			const cachePromise = resultsCache.createPromise(
				async resolve => {
					const response = await authKy
						.get('results', {
							signal,
							searchParams
						})
						.json<ResponseGetEstimatorPageResult>();

					const estimator: Estimator[] = [
						{
							name: estimatorName,
							pages: response.pages
						}
					];

					updateEstimators(estimator);

					const jobInputs = await getJobInputs(info, signal, cache);

					// if editor project data (with filter definitons etc.) is available, recreate references in results
					if (jobInputs?.input.inputJson) {
						const inputJsonForThisEstimator = {
							...jobInputs.input.inputJson,
							scoringManager: {
								...jobInputs.input.inputJson.scoringManager,
								outputs: jobInputs.input.inputJson.scoringManager.outputs.filter(
									output => output.name === estimatorName
								)
							}
						};

						const refsInResults = recreateRefsInResults(
							inputJsonForThisEstimator,
							estimator
						);

						const data: SpecificEstimator = {
							jobId,
							estimators: refsInResults ?? estimator,
							message: response.message
						};

						resolve(data);
					} else {
						// if editor project data is not available (i.e. running from user uploaded files),
						// return the results without recreating references
						const data: SpecificEstimator = {
							jobId,
							estimators: estimator,
							message: response.message
						};

						resolve(data);
					}
				},
				cacheKey,
				beforeCacheWrite
			);

			return await cachePromise;
		},
		[authKy, getJobInputs, resultsCache]
	);

	const getCurrentEstimators = useCallback(
		async (job_id: string) => {
			try {
				return await authKy
					.get('estimators', {
						searchParams: { job_id }
					})
					.json<EstimatorsItemResponse>();
			} catch (error) {
				console.error('Failed to fetch estimators:', error);

				return undefined;
			}
		},
		[authKy]
	);

	//TODO: fix backend responses and remove this function
	const validStatusToCache = (data: JobStatusCompleted | JobStatusFailed) => {
		if (data.jobState === StatusState.FAILED) return true;

		return data.jobTasksStatus.every(task => {
			if (currentTaskStatusData[StatusState.FAILED](task)) return true;
			else if (currentTaskStatusData[StatusState.COMPLETED](task)) {
				if (!task.startTime || !task.endTime)
					console.warn('There are missing times in COMPLETED task:', task);

				if (task.requestedPrimaries !== task.simulatedPrimaries) {
					console.warn(
						'Requested primaries and simulated primaries are not equal in COMPLETED task:',
						task
					);
					task.simulatedPrimaries = task.requestedPrimaries;
				}

				return true;
			}

			return false;
		});
	};

	const getJobStatus = useCallback(
		(...[info, cache = true, beforeCacheWrite, signal]: RequestGetJobStatus) =>
			(endpoint: string) => {
				const { jobId } = info;

				if (cache && statusDataCache.has(jobId))
					return Promise.resolve<JobStatusData>({
						...statusDataCache.get(jobId),
						...info
					});

				return authKy
					.get(endpoint, {
						signal,
						searchParams: camelToSnakeCase({ jobId })
					})
					.json<ResponseGetJobStatus>()
					.then(response => {
						const data = {
							...response,
							...info
						};

						if (
							currentJobStatusData[StatusState.PENDING](data) ||
							currentJobStatusData[StatusState.RUNNING](data) ||
							currentJobStatusData[StatusState.MERGING_QUEUED](data) ||
							currentJobStatusData[StatusState.MERGING_RUNNING](data)
						) {
							return data;
						}

						if (
							currentJobStatusData[StatusState.FAILED](data) ||
							currentJobStatusData[StatusState.CANCELED](data)
						) {
							statusDataCache.set(data.jobId, data, beforeCacheWrite);

							return data;
						}

						if (currentJobStatusData[StatusState.COMPLETED](data)) {
							if (validStatusToCache(data)) {
								statusDataCache.set(data.jobId, data, beforeCacheWrite);
							}

							return data;
						}

						return undefined;
					})
					.catch(e => {
						console.error(e);

						return undefined;
					});
			},
		[authKy, statusDataCache]
	);

	const cancelJob = useCallback(
		(...[info, signal]: RequestCancelJob) =>
			authKy
				.delete(info.endpointUrl ? info.endpointUrl : getEndpointFromSimulationInfo(info), {
					signal,
					searchParams: camelToSnakeCase({ jobId: info.jobId })
				})
				.then(() => {
					statusDataCache.delete(info.jobId);
				}),
		[authKy, statusDataCache]
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

					return getJobStatus(info, cache, beforeCacheWrite, signal)('jobs');
				})
			).then(dataList => {
				const data = dataList.filter(data => data !== undefined) as JobStatusData[];

				return data.length === 0 ? undefined : data;
			});
		},
		[getJobStatus]
	);

	const prepareEstimatorItemByPageDimension = (
		estimators: EstimatorItem[]
	): EstimatorPagesByDimensions[] => {
		return estimators.map(estimator => {
			const { name, pagesMetadata } = estimator;
			const pagesByDimensions: Record<string, PageDimension> = {};

			pagesMetadata.forEach(page => {
				const { pageDimension, pageName, pageNumber } = page;

				if (!pagesByDimensions[pageDimension]) {
					pagesByDimensions[pageDimension] = { names: [], pageNums: [] };
				}

				pagesByDimensions[pageDimension].names.push(pageName);
				pagesByDimensions[pageDimension].pageNums.push(pageNumber);
			});

			return {
				name,
				pagesByDimensions
			};
		});
	};

	// This function is used to find the first estimator name in the simulation data to fetch the results for estimators.
	// If name isn't passed, it will try to find the first estimator name in the simulation data.
	// If the name isn't found, it will try to get name from the backend.
	// It wouldn't be handled if we load the example.
	const findEstimatorsNamesAndPages = useCallback(
		async (
			jobStatus: JobStatusData,
			inputs: JobInputs | undefined,
			givenEstimatorName?: string
		) => {
			if (!givenEstimatorName && jobStatus.jobState === StatusState.COMPLETED) {
				if (inputs && !inputs.input.estimatorsItems) {
					const estimators = await getCurrentEstimators(jobStatus.jobId);

					if (estimators) {
						inputs.input.estimatorsItems = prepareEstimatorItemByPageDimension(
							estimators.estimatorsMetadata
						);
					}
				}
			}

			const firstEstimatorInputFileName = inputs?.input.estimatorsItems?.[0].name;

			if (givenEstimatorName) {
				return givenEstimatorName;
			}

			if (firstEstimatorInputFileName) {
				return firstEstimatorInputFileName;
			}
		},
		[getCurrentEstimators]
	);

	const getFullSimulationData = useCallback(
		async (
			jobStatus: JobStatusData,
			signal?: AbortSignal,
			cache = true,
			givenEstimatorName?: string
		) => {
			const inputs: JobInputs | undefined = await getJobInputs(jobStatus, signal, cache);

			const firstEstimatorName = await findEstimatorsNamesAndPages(
				jobStatus,
				inputs,
				givenEstimatorName
			);

			const estimatorsPagesByDimensions = inputs?.input.estimatorsItems?.filter(
				estimator => estimator.name === firstEstimatorName
			)?.[0].pagesByDimensions;

			if (estimatorsPagesByDimensions) {
				const allResults: JobResults[] = [];

				for (const [dimension, pageDimension] of Object.entries(
					estimatorsPagesByDimensions
				)) {
					const results =
						firstEstimatorName &&
						(await getEstimatorsPages(
							{
								jobId: jobStatus.jobId,
								estimatorName: firstEstimatorName,
								pageNumbers: pageDimension.pageNums
							},
							signal,
							cache
						));

					if (results) {
						allResults.push(results);
					}
				}

				if (!inputs || allResults.length === 0) return undefined;

				const aggregationResults = allResults.reduce(
					(acc, result) => {
						result.estimators.forEach(estimator => {
							const existingEstimator = acc.estimators.find(
								e => e.name === estimator.name
							);

							if (existingEstimator) {
								existingEstimator.pages.push(...estimator.pages);
							} else {
								acc.estimators.push(estimator);
							}
						});

						return acc;
					},
					{ jobId: jobStatus.jobId, estimators: [], message: '' } as JobResults
				);

				const { message, ...mergedData } = {
					...inputs,
					...aggregationResults,
					...jobStatus
				};

				const simData: FullSimulationData = mergedData satisfies ValidateShape<
					typeof mergedData,
					FullSimulationData
				>;

				return simData;
			}
		},
		[findEstimatorsNamesAndPages, getJobInputs, getEstimatorsPages]
	);

	return (
		<ShSimulationContextProvider
			value={{
				postJobDirect: postJob('jobs/direct'),
				postJobBatch: postJob('jobs/batch'),
				cancelJob,
				getHelloWorld,
				getJobStatus: (...args: RequestGetJobStatus) => {
					return getJobStatus(...args)(getEndpointFromSimulationInfo(args[0]));
				},
				getPageContents,
				getPageStatus,
				getJobInputs,
				getJobResults,
				getEstimatorsPages,
				getJobLogs,
				getFullSimulationData
			}}>
			{children}
		</ShSimulationContextProvider>
	);
};

export { ShSimulation, useShSimulation };
