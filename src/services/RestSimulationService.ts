import { KyInstance } from 'ky';

import { Estimator } from '../JsRoot/GraphData';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { addCustomStoppingPowerTableToEditorJSON } from '../ThreeEditor/Simulation/CustomStoppingPower/CustomStoppingPower';
import { FilterJSON } from '../ThreeEditor/Simulation/Scoring/ScoringFilter';
import { ScoringManagerJSON } from '../ThreeEditor/Simulation/Scoring/ScoringManager';
import {
	isEditorJson,
	JobInputs,
	JobLogs,
	JobResults,
	RequestCancelJob,
	RequestGetJobInputs,
	RequestGetJobLogs,
	RequestGetJobResult,
	RequestGetJobResults,
	RequestGetJobStatus,
	RequestGetPageContents,
	RequestGetPageStatus,
	RequestPostJob,
	SpecificEstimator
} from '../types/RequestTypes';
import {
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
	ValidStatusStates,
	YaptideResponse
} from '../types/ResponseTypes';
import { FullSimulationData, SimulationService } from '../types/SimulationService';
import { camelToSnakeCase } from '../util/Notation/Notation';
import { ValidateShape } from '../util/Types';
import { SimulationSourceType } from '../WrapperApp/components/Simulation/RunSimulationForm';
import CacheMap from './CacheMap';

const CACHEABLE_STATUSES = new Set([
	StatusState.FAILED,
	StatusState.CANCELED,
	StatusState.COMPLETED
]);

const VALID_STATUSES = new Set(ValidStatusStates);

//TODO: fix backend responses and remove this function
//TODO: (2025) Find out what does the above mean & fix
function validStatusToCache(data: JobStatusCompleted | JobStatusFailed) {
	if (data.jobState === StatusState.FAILED) {
		return true;
	}

	return data.jobTasksStatus.every(task => {
		if (task.taskState && task.taskState === StatusState.FAILED) {
			return true;
		}

		if (task.taskState && task.taskState === StatusState.COMPLETED) {
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
}

/**
 * Returns the endpoint based on the simulation info.
 * If the platform is not known, it will return 'jobs/direct'.
 * The platform name is stored in metadata of the simulation info and is typed by `PlatformType`.
 * Endpoints are named after the platform types.
 * @see PlatformType
 * @param info - The simulation info object.
 * @returns The endpoint string.
 */
export function getEndpointFromSimulationInfo(info: SimulationInfo) {
	const platform =
		`jobs/${info.metadata.platform.toLowerCase()}` as `jobs/${Lowercase<PlatformType>}`;

	if (['jobs/direct', 'jobs/batch'].includes(platform)) return platform;
	console.error(`Simulation platform is unknown: ${info.metadata.platform}`);

	return 'jobs';
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
function recreateRefToScoringManagerOutputs(
	estimators: Estimator[],
	scoringManagerJSON: ScoringManagerJSON
): Estimator[] {
	// Iterate through each estimator and set the scoringOutputJsonRef to the corresponding output in scoringManagerJSON
	estimators.forEach((estimator, index) => {
		estimator.scoringOutputJsonRef = scoringManagerJSON.outputs[index];
	});

	return estimators;
}

/**
 * Recreates references between estimators, their pages and filters by linking filter UUIDs with actual filter objects.
 * This rebuilds the relationships between estimator pages and their associated filters from the Filter JSON.
 *
 * @param estimators - Array of estimators containing pages that need filter references rebuilt
 * @param FiltersJSON - Array of filter objects that contain the actual filter definitions
 * @returns The estimators array with updated filter references for each page
 */
function recreateRefToFilters(estimators: Estimator[], FiltersJSON: FilterJSON[]): Estimator[] {
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
}

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

function updateEstimators(estimators: Estimator[]) {
	for (const estimator of estimators) {
		estimator.name = estimator.name.replace(/_$/, '');
	}
}

export default class RestSimulationService implements SimulationService {
	authKy: KyInstance;
	inputsCache: CacheMap<JobInputs>;
	logsCache: CacheMap<JobLogs>;
	statusDataCache: CacheMap<JobStatusData>;
	resultsCache: CacheMap<JobResults>;

	constructor(authKy: KyInstance) {
		this.authKy = authKy;
		this.inputsCache = new CacheMap();
		this.logsCache = new CacheMap();
		this.statusDataCache = new CacheMap();
		this.resultsCache = new CacheMap();
	}

	async helloWorld(signal?: AbortSignal): Promise<boolean> {
		const response = await this.authKy.get(``, { signal }).json<YaptideResponse>();

		return !!response.message;
	}

	async postJob(...args: RequestPostJob): Promise<ResponsePostJob> {
		let [simData, inputType, runType, ntasks, simType, title, batchOptions, signal] = args;

		if (title === undefined && isEditorJson(simData)) {
			title = simData.project.title;
		}

		const mapType: { [k in SimulationSourceType]: string } = {
			editor: 'json',
			files: 'files'
		};

		if (inputType === 'editor' && isEditorJson(simData)) {
			await addCustomStoppingPowerTableToEditorJSON(simData);
		}

		const filedName = mapType[inputType];

		if (filedName === undefined) throw new Error('Invalid input type ' + inputType);

		return this.authKy
			.post(`jobs/${runType}`, {
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
			})
			.json<ResponsePostJob>();
	}

	async getJobInputs(...args: RequestGetJobInputs): Promise<JobInputs | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;
		const { jobId } = info;

		if (cache && this.inputsCache.has(jobId)) {
			return Promise.resolve(this.inputsCache.get(jobId));
		}

		const cachePromise = this.inputsCache.createPromise(
			async resolve => {
				const response = await this.authKy
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
	}

	async getJobStatus(...args: RequestGetJobStatus): Promise<JobStatusData | undefined> {
		const [info, cache = true, beforeCacheWrite, signal] = args;
		const { jobId } = info;

		if (cache && this.statusDataCache.has(jobId))
			return Promise.resolve<JobStatusData>({
				...this.statusDataCache.get(jobId),
				...info
			});

		const runType = info.metadata.platform.toLowerCase();

		return this.authKy
			.get(`jobs/${runType}`, {
				signal,
				searchParams: camelToSnakeCase({ jobId })
			})
			.json<ResponseGetJobStatus>()
			.then(response => {
				const data = {
					...response,
					...info
				};

				if (!VALID_STATUSES.has(data.jobState)) {
					return undefined;
				}

				if (!CACHEABLE_STATUSES.has(data.jobState)) {
					return data;
				}

				// only cacheable statuses left: completed, failed, cancelled

				if (data.jobState !== StatusState.COMPLETED || validStatusToCache(data)) {
					// job is either completed & valid or failed/cancelled
					this.statusDataCache.set(data.jobId, data, beforeCacheWrite);
				}

				return data;
			})
			.catch(e => {
				console.error(e);

				return undefined;
			});
	}

	async getJobLogs(...args: RequestGetJobLogs): Promise<JobLogs | undefined> {
		const [info, signal, cache, beforeCacheWrite] = args;
		const { jobId } = info;

		if (cache && this.logsCache.has(jobId)) return this.logsCache.get(jobId);

		const cachePromise = this.logsCache.createPromise(
			async resolve => {
				const response = await this.authKy
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
	}

	async getJobResults(...args: RequestGetJobResults): Promise<JobResults | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;
		const { jobId } = info;

		if (cache && this.resultsCache.has(jobId)) return this.resultsCache.get(jobId);

		const cachePromise = this.resultsCache.createPromise(
			async resolve => {
				const response = await this.authKy
					.get('results', {
						signal,
						searchParams: camelToSnakeCase({ jobId })
					})
					.json<ResponseGetJobResults>();

				updateEstimators(response.estimators);

				const jobInputs = await this.getJobInputs(info, signal, cache);

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
	}

	private preparePageNumbers(pageNumbers: number[]): string {
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
	}

	async getEstimatorsPages(...args: RequestGetJobResult): Promise<JobResults | undefined> {
		const [info, signal, cache = true, beforeCacheWrite] = args;
		const { jobId, estimatorName, pageNumbers } = info;

		const searchParams = new URLSearchParams({
			job_id: jobId,
			estimator_name: estimatorName,
			page_numbers: this.preparePageNumbers(pageNumbers)
		});

		const cacheKey = `${jobId}-${estimatorName}-${pageNumbers.join(',')}`;

		if (cache && this.resultsCache.has(cacheKey)) {
			const data: Promise<JobResults> | JobResults | undefined =
				this.resultsCache.get(cacheKey);

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

		const cachePromise = this.resultsCache.createPromise(
			async resolve => {
				const response = await this.authKy
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

				const jobInputs = await this.getJobInputs(info, signal, cache);

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
	}

	private async getCurrentEstimators(job_id: string) {
		try {
			return await this.authKy
				.get('estimators', {
					searchParams: { job_id }
				})
				.json<EstimatorsItemResponse>();
		} catch (error) {
			console.error('Failed to fetch estimators:', error);

			return undefined;
		}
	}

	private prepareEstimatorItemByPageDimension(
		estimators: EstimatorItem[]
	): EstimatorPagesByDimensions[] {
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
	}

	/**
	 * This function is used to find the first estimator name in the simulation data to fetch the results for estimators.
	 * If name isn't passed, it will try to find the first estimator name in the simulation data.
	 * If the name isn't found, it will try to get name from the backend.
	 * It wouldn't be handled if we load the example.
	 */
	private async findEstimatorsNamesAndPages(
		jobStatus: JobStatusData,
		inputs: JobInputs | undefined,
		givenEstimatorName?: string
	) {
		if (!givenEstimatorName && jobStatus.jobState === StatusState.COMPLETED) {
			if (inputs && !inputs.input.estimatorsItems) {
				const estimators = await this.getCurrentEstimators(jobStatus.jobId);

				if (estimators) {
					inputs.input.estimatorsItems = this.prepareEstimatorItemByPageDimension(
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
	}

	async getFullSimulationData(
		jobStatus: JobStatusData,
		signal?: AbortSignal,
		cache: boolean = true,
		givenEstimatorName?: string
	): Promise<FullSimulationData | undefined> {
		const inputs: JobInputs | undefined = await this.getJobInputs(jobStatus, signal, cache);

		const firstEstimatorName = await this.findEstimatorsNamesAndPages(
			jobStatus,
			inputs,
			givenEstimatorName
		);

		const estimatorsPagesByDimensions = inputs?.input.estimatorsItems?.filter(
			estimator => estimator.name === firstEstimatorName
		)?.[0].pagesByDimensions;

		if (estimatorsPagesByDimensions) {
			const allResults: JobResults[] = [];

			for (const [dimension, pageDimension] of Object.entries(estimatorsPagesByDimensions)) {
				const results =
					firstEstimatorName &&
					(await this.getEstimatorsPages(
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
	}

	getPageContents(...args: RequestGetPageContents): Promise<ResponseGetPageContents> {
		const [pageIdx, pageSize, orderType, orderBy, jobState, signal] = args;

		return this.authKy
			.get(`user/simulations`, {
				signal,
				searchParams: camelToSnakeCase({
					pageIdx,
					pageSize,
					orderType,
					orderBy,
					jobState: jobState.join(',')
				})
			})
			.json<ResponseGetPageContents>();
	}

	getPageStatus(...args: RequestGetPageStatus): Promise<JobStatusData[] | undefined> {
		const [infoList, cache = true, beforeCacheWrite, signal] = args;

		return Promise.all(
			infoList.map(async info => {
				if (info.metadata.platform === undefined) {
					console.error('info.metadata.platform is undefined');

					return undefined;
				}

				return await this.getJobStatus(info, cache, beforeCacheWrite, signal);
			})
		).then(dataList => {
			const data = dataList.filter(data => data !== undefined) as JobStatusData[];

			return data.length === 0 ? undefined : data;
		});
	}

	async cancelJob(...args: RequestCancelJob): Promise<void> {
		const [info, signal] = args;

		await this.authKy
			.delete(info.endpointUrl ? info.endpointUrl : getEndpointFromSimulationInfo(info), {
				signal,
				searchParams: camelToSnakeCase({ jobId: info.jobId })
			})
			.then(() => {
				this.statusDataCache.delete(info.jobId);
			});
	}
}
