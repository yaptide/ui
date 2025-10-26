// Additional credits:
// - @kmichalik

import { useCallback, useEffect, useState } from 'react';

import Geant4Worker from './Geant4Worker';

export enum DownloadManagerStatus {
	IDLE,
	WORKING,
	FINISHED,
	ERROR
}

export enum DatasetDownloadStatus {
	IDLE,
	DOWNLOADING,
	PROCESSING,
	DONE
}

export interface DatasetStatus {
	name: string;
	status: DatasetDownloadStatus;
	done?: number;
	total?: number;
}

export function useDatasetDownloadManager() {
	const [managerState, setManagerState] = useState<DownloadManagerStatus>(
		DownloadManagerStatus.IDLE
	);
	const [datasetStates, setDatasetStates] = useState<Record<string, DatasetStatus>>({});
	const [dataset, setDataset] = useState<string | undefined>();
	const [idle, setIdle] = useState<boolean>(false);
	const [worker, setWorker] = useState<Geant4Worker>(new Geant4Worker());
	let initCalled = false;

	const startDownload = useCallback(
		idle
			? () => {
					worker.loadDeps().then(() => {
						setManagerState(DownloadManagerStatus.FINISHED);
						setIdle(true);
					});
					setManagerState(DownloadManagerStatus.WORKING);
					setIdle(false);

					const interval = setInterval(async () => {
						const progress = await worker.pollDatasetProgress();

						if (progress) {
							const newDatasetStates: Record<string, DatasetStatus> = {};

							for (const [datasetName, datasetProgress] of Object.entries(progress)) {
								let status: DatasetDownloadStatus;

								switch (datasetProgress.stage) {
									case 'downloading':
										status = DatasetDownloadStatus.DOWNLOADING;

										break;
									case 'preparing':
										status = DatasetDownloadStatus.PROCESSING;

										break;
									case 'done':
										status = DatasetDownloadStatus.DONE;

										break;
									default:
										status = DatasetDownloadStatus.IDLE;
								}

								newDatasetStates[datasetName] = {
									name: datasetName,
									status,
									done: Math.floor(datasetProgress.progress * 100),
									total: 100
								};
							}

							setDatasetStates(prev => ({ ...prev, ...newDatasetStates }));
						}
					}, 1000);
				}
			: () => {},
		[worker, idle]
	);

	useEffect(() => {
		if (initCalled) return;
		worker.init().then(() => setIdle(true));
		initCalled = true;
	}, []);

	return { managerState, datasetStates: Object.values(datasetStates), startDownload };
}
