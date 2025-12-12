/**
 * Service to detect and manage Geant4 dataset cache status in IndexedDB.
 * The Emscripten preload scripts store datasets in IndexedDB with:
 * - Database name: EM_PRELOAD_CACHE
 * - Store: METADATA (contains package UUIDs and chunk counts)
 * - Store: PACKAGES (contains the actual data chunks)
 *
 * Cache keys are constructed as: metadata/<PACKAGE_PATH><PACKAGE_NAME>
 * where PACKAGE_PATH is URL-encoded window.location.pathname + '/'
 * and PACKAGE_NAME comes from the preload script (e.g., '/memfs/.../G4EMLOW8.6.1.data')
 *
 * We detect cached datasets by matching the .data file suffix in IndexedDB keys.
 */

export const GEANT4_DATASETS = [
	{ name: 'G4EMLOW8.6.1', dataFile: 'G4EMLOW8.6.1.data', approximateSizeMB: 580 },
	{ name: 'G4ENSDFSTATE3.0', dataFile: 'G4ENSDFSTATE3.0.data', approximateSizeMB: 0.1 },
	{ name: 'G4NDL4.7.1', dataFile: 'G4NDL4.7.1.data', approximateSizeMB: 583 },
	{ name: 'G4PARTICLEXS4.1', dataFile: 'G4PARTICLEXS4.1.data', approximateSizeMB: 103 },
	{ name: 'G4SAIDDATA2.0', dataFile: 'G4SAIDDATA2.0.data', approximateSizeMB: 0.8 },
	{ name: 'PhotonEvaporation6.1', dataFile: 'PhotonEvaporation6.1.data', approximateSizeMB: 47 }
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
	datasets: Record<string, DatasetCacheStatus>;
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
async function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject('IndexedDB is not supported in this environment');
		}

		const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

		openRequest.onupgradeneeded = event => {
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
			resolve(db);
		};

		openRequest.onerror = () => {
			reject('Failed to open IndexedDB database');
		};
	});
}

/**
 * Checks if a specific dataset is cached in IndexedDB by looking for any key ending with the dataFile
 * The cache keys end with the .data filename (e.g., 'G4EMLOW8.6.1.data')
 */
async function checkDatasetCachedByDataFile(
	db: IDBDatabase,
	dataFile: string,
	allMetadataKeys: string[]
): Promise<boolean> {
	// Find any key that ends with our dataFile (after removing 'metadata/' prefix)
	const matchingKey = allMetadataKeys.find(key => {
		// Keys are stored as 'metadata/<PACKAGE_PATH><PACKAGE_NAME>'
		// where PACKAGE_NAME ends with the dataFile (e.g., '/memfs/.../G4EMLOW8.6.1.data')
		const keyWithoutPrefix = key.replace(/^metadata\//, '');
		// The keyWithoutPrefix might be URL-encoded, so try both
		const decoded = decodeURIComponent(keyWithoutPrefix);

		return keyWithoutPrefix.endsWith(dataFile) || decoded.endsWith(dataFile);
	});

	if (matchingKey) {
		const result = await getMetadataValue(db, matchingKey);

		if (result && result.uuid) {
			return true;
		}
	}

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
				resolve(keys);
			};

			getAllKeysRequest.onerror = () => {
				resolve([]);
			};
		} catch (error) {
			resolve([]);
		}
	});
}

/**
 * Checks the cache status of all Geant4 datasets
 */
export async function checkAllDatasetsCacheStatus(): Promise<CacheStatusResult> {
	const db = await openDatabase();

	if (!db) {
		return {
			datasets: Object.fromEntries(
				GEANT4_DATASETS.map(ds => [
					ds.name,
					{
						name: ds.name,
						isCached: false,
						approximateSizeMB: ds.approximateSizeMB
					}
				])
			),
			cachedCount: 0,
			totalCount: GEANT4_DATASETS.length,
			estimatedCachedSizeMB: 0,
			estimatedTotalSizeMB: TOTAL_DATASET_SIZE_MB
		};
	}

	try {
		// First, list all metadata keys for debugging
		const allKeys = await listAllMetadataKeys(db);

		const datasetStatuses: Record<string, DatasetCacheStatus> = await Promise.all(
			GEANT4_DATASETS.map(async ds => {
				const isCached = await checkDatasetCachedByDataFile(db, ds.dataFile, allKeys);

				return [
					ds.name,
					{
						name: ds.name,
						isCached,
						approximateSizeMB: ds.approximateSizeMB
					}
				] as const;
			})
		).then(entries => Object.fromEntries(entries));

		const cachedDatasets = Object.values(datasetStatuses).filter(ds => ds.isCached);

		const result: CacheStatusResult = {
			datasets: datasetStatuses,
			cachedCount: cachedDatasets.length,
			totalCount: GEANT4_DATASETS.length,
			estimatedCachedSizeMB: cachedDatasets.reduce(
				(sum, ds) => sum + ds.approximateSizeMB,
				0
			),
			estimatedTotalSizeMB: TOTAL_DATASET_SIZE_MB
		};

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
			return resolve(false);
		}

		const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

		deleteRequest.onsuccess = () => resolve(true);
		deleteRequest.onerror = () => resolve(false);
		deleteRequest.onblocked = () => resolve(false);
	});
}
