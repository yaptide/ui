// Additional credits:
// - @kmichalik

import {
	createContext,
	Dispatch,
	FC,
	ReactNode,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState
} from 'react';

import {
	checkAllDatasetsCacheStatus,
	clearDatasetCache,
	GEANT4_DATASETS,
	getStorageEstimate,
	StorageEstimate,
	TOTAL_DATASET_SIZE_MB
} from './Geant4DatasetCacheService';
import Geant4Worker from './Geant4Worker';

export enum DownloadManagerStatus {
	IDLE,
	WORKING,
	FINISHED,
	ERROR
}

export enum DatasetDownloadStatus {
	IDLE,
	CACHED,
	DOWNLOADING,
	PROCESSING,
	DONE
}

const statusTypeMap: Record<string, DatasetDownloadStatus> = {
	downloading: DatasetDownloadStatus.DOWNLOADING,
	preparing: DatasetDownloadStatus.PROCESSING,
	done: DatasetDownloadStatus.DONE
};

export interface DatasetStatus {
	name: string;
	status: DatasetDownloadStatus;
	done?: number;
	total?: number;
	totalSizeMB?: number;
}

async function fetchProgress(
	worker: Geant4Worker,
	setDatasetStates: Dispatch<SetStateAction<Record<string, DatasetStatus>>>
) {
	if (!worker.getIsInitialized()) return;

	const progress = await worker.pollDatasetProgress();

	if (progress) {
		setDatasetStates(prev => {
			const newStates: Record<string, DatasetStatus> = { ...prev };

			for (const [datasetName, datasetProgress] of Object.entries(progress)) {
				let status = statusTypeMap[datasetProgress.stage] ?? DatasetDownloadStatus.IDLE;

				newStates[datasetName] = {
					...newStates[datasetName],
					name: datasetName,
					status,
					done: Math.floor(datasetProgress.progress * 100),
					total: 100
				};
			}

			return newStates;
		});
	}
}

type StartDownloadArgs = {
	worker: Geant4Worker;
	managerState: DownloadManagerStatus;
	setManagerState: Dispatch<SetStateAction<DownloadManagerStatus>>;
	setDatasetStates: Dispatch<SetStateAction<Record<string, DatasetStatus>>>;
	setIdle: Dispatch<SetStateAction<boolean>>;
};

function startDownload({
	worker,
	managerState,
	setManagerState,
	setDatasetStates,
	setIdle
}: StartDownloadArgs) {
	if (managerState !== DownloadManagerStatus.IDLE || !worker.getIsInitialized()) {
		return;
	}

	const loadDepsPromise = worker.loadDeps();

	const interval = setInterval(async () => {
		await fetchProgress(worker, setDatasetStates);
	}, 500);

	loadDepsPromise
		.then(async () => {
			clearInterval(interval);

			await fetchProgress(worker, setDatasetStates);

			setManagerState(DownloadManagerStatus.FINISHED);
			worker.destroy();
		})
		.catch(error => {
			console.error('Dataset download error:', error);
			setManagerState(DownloadManagerStatus.ERROR);
			clearInterval(interval);
		});
	setManagerState(DownloadManagerStatus.WORKING);
	setIdle(false);
}

export interface UseDatasetManagerResult {
	managerState: DownloadManagerStatus;
	datasetStatus: Record<string, DatasetStatus>;
	storageEstimate: StorageEstimate | null;
	isLoading: boolean;
	cachedCount: number;
	totalCount: number;
	downloadSizeNeededMB: number;
	startDownload: () => void;
	refresh: () => Promise<void>;
	clearCache: () => Promise<boolean>;
}

export function useDatasetManager(): UseDatasetManagerResult {
	const [managerState, setManagerState] = useState<DownloadManagerStatus>(
		DownloadManagerStatus.IDLE
	);
	const [datasetStates, setDatasetStates] = useState<Record<string, DatasetStatus>>({});
	const [idle, setIdle] = useState<boolean>(false);
	const [worker] = useState<Geant4Worker>(new Geant4Worker());
	const initCalledRef = useRef(false);

	const [storageEstimate, setStorageEstimate] = useState<StorageEstimate | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [cachedCount, setCachedCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);
	const [downloadSizeNeededMB, setDownloadSizeNeededMB] = useState(0);

	const refresh = useCallback(async () => {
		setIsLoading(true);

		try {
			const [status, storage] = await Promise.all([
				checkAllDatasetsCacheStatus(),
				getStorageEstimate()
			]);

			const cachedCount = status?.cachedCount ?? 0;
			const totalCount = status?.totalCount ?? 0;
			const downloadSizeNeededMB =
				cachedCount == totalCount
					? 0
					: TOTAL_DATASET_SIZE_MB - (status?.estimatedCachedSizeMB ?? 0);

			setCachedCount(cachedCount);
			setTotalCount(totalCount);
			setDownloadSizeNeededMB(downloadSizeNeededMB);
			setStorageEstimate(storage);
			setDatasetStates(prev => {
				const newStates: Record<string, DatasetStatus> = { ...prev };

				for (const ds of GEANT4_DATASETS) {
					const newStatus = status.datasets[ds.name]?.isCached
						? DatasetDownloadStatus.CACHED
						: DatasetDownloadStatus.IDLE;

					newStates[ds.name] = {
						name: ds.name,
						status:
							prev[ds.name]?.status !== DatasetDownloadStatus.DOWNLOADING &&
							prev[ds.name]?.status !== DatasetDownloadStatus.PROCESSING
								? newStatus
								: prev[ds.name]?.status,
						totalSizeMB: ds.approximateSizeMB
					};
				}

				return newStates;
			});
		} catch (error) {
			console.error('Failed to check dataset cache status:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const clearCache = useCallback(async () => {
		const success = await clearDatasetCache();

		if (success) {
			await refresh();
		}

		setManagerState(DownloadManagerStatus.IDLE);

		return success;
	}, [refresh, setManagerState]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		if (initCalledRef.current) return;
		worker
			.init()
			.then(() => setIdle(true))
			.catch(error => {
				setManagerState(DownloadManagerStatus.ERROR);
				console.error('Failed to initialize Geant4 worker for dataset download:', error);
			});
		initCalledRef.current = true;
	}, [worker]);

	const startDownloadSimple = useCallback(() => {
		if (!idle) return;

		startDownload({ worker, managerState, setManagerState, setDatasetStates, setIdle });
	}, [worker, idle, managerState]);

	return {
		managerState,
		datasetStatus: datasetStates,
		storageEstimate,
		isLoading,
		cachedCount,
		totalCount,
		downloadSizeNeededMB,
		refresh,
		clearCache,
		startDownload: startDownloadSimple
	};
}
