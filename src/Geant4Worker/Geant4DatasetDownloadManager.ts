// Additional credits:
// - @kmichalik

import { useCallback, useEffect, useRef, useState } from 'react';

import Geant4Worker from './Geant4Worker';

export enum DownloadManagerStatus {
	IDLE,
	WORKING,
	FINISHED,
	ERROR
}

export enum DatasetDownloadStatus {
	IDLE = 'idle',
	DOWNLOADING = 'downloading',
	PROCESSING = 'processing',
	DONE = 'done'
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
}

export function useDatasetDownloadManager() {
	const [managerState, setManagerState] = useState<DownloadManagerStatus>(
		DownloadManagerStatus.IDLE
	);
	const [datasetStates, setDatasetStates] = useState<Record<string, DatasetStatus>>({});
	const [idle, setIdle] = useState<boolean>(false);
	const [worker] = useState<Geant4Worker>(new Geant4Worker());
	const initCalledRef = useRef(false);

	const fetchProgress = async () => {
		const progress = await worker.pollDatasetProgress();

		if (progress) {
			const newDatasetStates: Record<string, DatasetStatus> = {};

			for (const [datasetName, datasetProgress] of Object.entries(progress)) {
				let status = statusTypeMap[datasetProgress.stage];

				newDatasetStates[datasetName] = {
					name: datasetName,
					status,
					done: Math.floor(datasetProgress.progress * 100),
					total: 100
				};
			}

			setDatasetStates(prev => ({ ...prev, ...newDatasetStates }));
		}
	};

	const startDownload = useCallback(
		idle
			? () => {
					const loadDepsPromise = worker.loadDeps();

					const interval = setInterval(async () => {
						await fetchProgress();
					}, 1000);

					loadDepsPromise.then(async () => {
						clearInterval(interval);

						await fetchProgress();

						setManagerState(DownloadManagerStatus.FINISHED);
						setIdle(true);
						worker.destroy();
					});
					setManagerState(DownloadManagerStatus.WORKING);
					setIdle(false);
				}
			: () => {},
		[worker, idle]
	);

	useEffect(() => {
		if (initCalledRef.current) return;
		worker.init().then(() => setIdle(true));
		initCalledRef.current = true;
	}, [worker]);

	return { managerState, datasetStates: Object.values(datasetStates), startDownload };
}
