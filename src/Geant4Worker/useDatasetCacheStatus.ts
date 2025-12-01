import { useCallback, useEffect, useState } from 'react';

import {
	CacheStatusResult,
	checkAllDatasetsCacheStatus,
	clearDatasetCache,
	getStorageEstimate,
	StorageEstimate,
	TOTAL_DATASET_SIZE_MB
} from './Geant4DatasetCacheService';

export interface UseDatasetCacheStatusResult {
	/** Cache status for all datasets */
	cacheStatus: CacheStatusResult | null;
	/** Browser storage estimate */
	storageEstimate: StorageEstimate | null;
	/** Whether the cache status is being loaded */
	isLoading: boolean;
	/** Whether all datasets are cached */
	allCached: boolean;
	/** Number of cached datasets */
	cachedCount: number;
	/** Total number of datasets */
	totalCount: number;
	/** Estimated size in MB that would need to be downloaded */
	downloadSizeNeededMB: number;
	/** Refresh the cache status */
	refresh: () => Promise<void>;
	/** Clear all cached datasets */
	clearCache: () => Promise<boolean>;
}

/**
 * Hook to check and monitor Geant4 dataset cache status
 */
export function useDatasetCacheStatus(): UseDatasetCacheStatusResult {
	const [cacheStatus, setCacheStatus] = useState<CacheStatusResult | null>(null);
	const [storageEstimate, setStorageEstimate] = useState<StorageEstimate | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refresh = useCallback(async () => {
		setIsLoading(true);

		try {
			const [status, storage] = await Promise.all([
				checkAllDatasetsCacheStatus(),
				getStorageEstimate()
			]);
			setCacheStatus(status);
			setStorageEstimate(storage);
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

		return success;
	}, [refresh]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const allCached = cacheStatus?.allCached ?? false;
	const cachedCount = cacheStatus?.cachedCount ?? 0;
	const totalCount = cacheStatus?.totalCount ?? 0;
	const downloadSizeNeededMB = allCached
		? 0
		: TOTAL_DATASET_SIZE_MB - (cacheStatus?.estimatedCachedSizeMB ?? 0);

	return {
		cacheStatus,
		storageEstimate,
		isLoading,
		allCached,
		cachedCount,
		totalCount,
		downloadSizeNeededMB,
		refresh,
		clearCache
	};
}
