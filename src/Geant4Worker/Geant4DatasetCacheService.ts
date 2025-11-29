/**
 * Service to detect and manage Geant4 dataset cache status in IndexedDB.
 * The Emscripten preload scripts store datasets in IndexedDB with:
 * - Database name: EM_PRELOAD_CACHE
 * - Store: METADATA (contains package UUIDs and chunk counts)
 * - Store: PACKAGES (contains the actual data chunks)
 */

// Dataset information matching what's in the preload scripts
// Note: The actual key in IndexedDB is: metadata/<PACKAGE_PATH><PACKAGE_NAME>
// where PACKAGE_PATH is URL-encoded current page path
export const GEANT4_DATASETS = [
	{
		name: 'G4EMLOW8.6.1',
		// The suffix that appears in the metadata key (after any path prefix)
		keySuffix: '/memfs/18333901/geant-web-application/build/data/G4EMLOW8.6.1.data',
		approximateSizeMB: 580
	},
	{
		name: 'G4ENSDFSTATE3.0',
		keySuffix: '/memfs/18333901/geant-web-application/build/data/G4ENSDFSTATE3.0.data',
		approximateSizeMB: 0.1
	},
	{
		name: 'G4NDL4.7.1',
		keySuffix: '/memfs/18333901/geant-web-application/build/data/G4NDL4.7.1.data',
		approximateSizeMB: 583
	},
	{
		name: 'G4PARTICLEXS4.1',
		keySuffix: '/memfs/18333901/geant-web-application/build/data/G4PARTICLEXS4.1.data',
		approximateSizeMB: 103
	},
	{
		name: 'G4SAIDDATA2.0',
		keySuffix: '/memfs/18333901/geant-web-application/build/data/G4SAIDDATA2.0.data',
		approximateSizeMB: 0.8
	},
	{
		name: 'PhotonEvaporation6.1',
		keySuffix: '/memfs/18333901/geant-web-application/build/data/PhotonEvaporation6.1.data',
		approximateSizeMB: 47
	}
] as const;

export const TOTAL_DATASET_SIZE_MB = GEANT4_DATASETS.reduce(
	(sum, ds) => sum + ds.approximateSizeMB,
	0
);

const DB_NAME = 'EM_PRELOAD_CACHE';
const DB_VERSION = 1;
const METADATA_STORE_NAME = 'METADATA';
const PACKAGES_STORE_NAME = 'PACKAGES';

export interface DatasetCacheStatus {
	name: string;
	isCached: boolean;
	approximateSizeMB: number;
}

export interface CacheStatusResult {
	datasets: DatasetCacheStatus[];
	allCached: boolean;
	cachedCount: number;
	totalCount: number;
	estimatedCachedSizeMB: number;
	estimatedTotalSizeMB: number;
}

export interface StorageEstimate {
	usedMB: number;
	quotaMB: number;
	percentUsed: number;
}

/**
 * Opens the IndexedDB database used by Emscripten for caching
 */
async function openDatabase(): Promise<IDBDatabase | null> {
	if (typeof indexedDB === 'undefined') {
		console.warn('[CacheService] IndexedDB is not available');

		return null;
	}

	return new Promise((resolve, reject) => {
		console.log(`[CacheService] Opening IndexedDB database: ${DB_NAME}`);
		const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

		openRequest.onupgradeneeded = event => {
			// Database doesn't exist yet or needs upgrade - this means no cache
			console.log('[CacheService] Database upgrade needed - creating stores');
			const db = (event.target as IDBOpenDBRequest).result;
			// Create stores if they don't exist (they won't have data anyway)

			if (!db.objectStoreNames.contains(PACKAGES_STORE_NAME)) {
				db.createObjectStore(PACKAGES_STORE_NAME);
			}

			if (!db.objectStoreNames.contains(METADATA_STORE_NAME)) {
				db.createObjectStore(METADATA_STORE_NAME);
			}
		};

		openRequest.onsuccess = event => {
			const db = (event.target as IDBOpenDBRequest).result;
			console.log(`[CacheService] Database opened successfully. Object stores: ${Array.from(db.objectStoreNames).join(', ')}`);
			resolve(db);
		};

		openRequest.onerror = () => {
			console.warn('[CacheService] Failed to open IndexedDB:', openRequest.error);
			resolve(null);
		};
	});
}

/**
 * Checks if a specific dataset is cached in IndexedDB by looking for any key ending with the suffix
 */
async function checkDatasetCachedByKeySuffix(
	db: IDBDatabase,
	keySuffix: string,
	datasetName: string,
	allMetadataKeys: string[]
): Promise<boolean> {
	// Find any key that ends with our suffix (after removing 'metadata/' prefix)
	const matchingKey = allMetadataKeys.find(key => {
		// Keys are stored as 'metadata/<PACKAGE_PATH><PACKAGE_NAME>'
		// We need to check if the key ends with our keySuffix
		const keyWithoutPrefix = key.replace(/^metadata\//, '');
		// The keyWithoutPrefix might be URL-encoded, so try both
		const decoded = decodeURIComponent(keyWithoutPrefix);

		return keyWithoutPrefix.endsWith(keySuffix) || decoded.endsWith(keySuffix);
	});

	if (matchingKey) {
		console.log(`[CacheService] Dataset ${datasetName}: Found matching key "${matchingKey}"`);
		// Verify it has valid metadata
		const result = await getMetadataValue(db, matchingKey);

		if (result && result.uuid) {
			console.log(
				`[CacheService] Dataset ${datasetName}: CACHED (uuid: ${result.uuid}, chunkCount: ${result.chunkCount})`
			);

			return true;
		}
	}

	console.log(
		`[CacheService] Dataset ${datasetName}: NOT CACHED (no matching key for suffix "${keySuffix}")`
	);

	return false;
}

/**
 * Get the metadata value for a specific key
 */
async function getMetadataValue(
	db: IDBDatabase,
	key: string
): Promise<{ uuid: string; chunkCount: number } | null> {
	return new Promise(resolve => {
		try {
			const transaction = db.transaction([METADATA_STORE_NAME], 'readonly');
			const metadata = transaction.objectStore(METADATA_STORE_NAME);
			const getRequest = metadata.get(key);

			getRequest.onsuccess = () => {
				resolve(getRequest.result || null);
			};

			getRequest.onerror = () => {
				resolve(null);
			};
		} catch {
			resolve(null);
		}
	});
}

/**
 * Lists all keys in the METADATA store for debugging
 */
async function listAllMetadataKeys(db: IDBDatabase): Promise<string[]> {
	return new Promise(resolve => {
		try {
			const transaction = db.transaction([METADATA_STORE_NAME], 'readonly');
			const metadata = transaction.objectStore(METADATA_STORE_NAME);
			const getAllKeysRequest = metadata.getAllKeys();

			getAllKeysRequest.onsuccess = () => {
				const keys = getAllKeysRequest.result as string[];
				console.log(`[CacheService] All METADATA keys (${keys.length}):`, keys);
				resolve(keys);
			};

			getAllKeysRequest.onerror = () => {
				console.warn('[CacheService] Error listing metadata keys:', getAllKeysRequest.error);
				resolve([]);
			};
		} catch (error) {
			console.warn('[CacheService] Exception listing metadata keys:', error);
			resolve([]);
		}
	});
}

/**
 * Checks the cache status of all Geant4 datasets
 */
export async function checkAllDatasetsCacheStatus(): Promise<CacheStatusResult> {
	console.log('[CacheService] Starting cache status check...');
	const db = await openDatabase();

	if (!db) {
		console.warn('[CacheService] Database not available, returning all uncached');

		return {
			datasets: GEANT4_DATASETS.map(ds => ({
				name: ds.name,
				isCached: false,
				approximateSizeMB: ds.approximateSizeMB
			})),
			allCached: false,
			cachedCount: 0,
			totalCount: GEANT4_DATASETS.length,
			estimatedCachedSizeMB: 0,
			estimatedTotalSizeMB: TOTAL_DATASET_SIZE_MB
		};
	}

	try {
		// First, list all metadata keys for debugging
		const allKeys = await listAllMetadataKeys(db);
		console.log('[CacheService] Found metadata keys:', allKeys);

		const datasetStatuses: DatasetCacheStatus[] = await Promise.all(
			GEANT4_DATASETS.map(async ds => {
				const isCached = await checkDatasetCachedByKeySuffix(
					db,
					ds.keySuffix,
					ds.name,
					allKeys
				);

				return {
					name: ds.name,
					isCached,
					approximateSizeMB: ds.approximateSizeMB
				};
			})
		);

		const cachedDatasets = datasetStatuses.filter(ds => ds.isCached);

		const result: CacheStatusResult = {
			datasets: datasetStatuses,
			allCached: cachedDatasets.length === GEANT4_DATASETS.length,
			cachedCount: cachedDatasets.length,
			totalCount: GEANT4_DATASETS.length,
			estimatedCachedSizeMB: cachedDatasets.reduce((sum, ds) => sum + ds.approximateSizeMB, 0),
			estimatedTotalSizeMB: TOTAL_DATASET_SIZE_MB
		};

		console.log('[CacheService] Cache status result:', result);

		return result;
	} finally {
		db.close();
	}
}

/**
 * Gets browser storage estimate using the Storage API
 */
export async function getStorageEstimate(): Promise<StorageEstimate | null> {
	if (!navigator.storage || !navigator.storage.estimate) {
		return null;
	}

	try {
		const estimate = await navigator.storage.estimate();
		const usedMB = (estimate.usage ?? 0) / (1024 * 1024);
		const quotaMB = (estimate.quota ?? 0) / (1024 * 1024);

		return {
			usedMB,
			quotaMB,
			percentUsed: quotaMB > 0 ? (usedMB / quotaMB) * 100 : 0
		};
	} catch {
		return null;
	}
}

/**
 * Clears all cached Geant4 datasets from IndexedDB
 */
export async function clearDatasetCache(): Promise<boolean> {
	return new Promise(resolve => {
		if (typeof indexedDB === 'undefined') {
			resolve(false);

			return;
		}

		const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

		deleteRequest.onsuccess = () => resolve(true);
		deleteRequest.onerror = () => resolve(false);
		deleteRequest.onblocked = () => resolve(false);
	});
}
