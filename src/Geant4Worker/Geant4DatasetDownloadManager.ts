// Additional credits:
// - @kmichalik

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

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

async function fetchProgress(
	worker: Geant4Worker,
	setDatasetStates: Dispatch<SetStateAction<Record<string, DatasetStatus>>>
) {
	const progress = await worker.pollDatasetProgress();

	if (progress) {
		const newDatasetStates: Record<string, DatasetStatus> = {};

		for (const [datasetName, datasetProgress] of Object.entries(progress)) {
			let status = statusTypeMap[datasetProgress.stage] ?? DatasetDownloadStatus.IDLE;

			newDatasetStates[datasetName] = {
				name: datasetName,
				status,
				done: Math.floor(datasetProgress.progress * 100),
				total: 100
			};
		}

		setDatasetStates(prev => ({ ...prev, ...newDatasetStates }));
	}
}

type StartDownloadArgs = {
	worker: Geant4Worker;
	setManagerState: Dispatch<SetStateAction<DownloadManagerStatus>>;
	setDatasetStates: Dispatch<SetStateAction<Record<string, DatasetStatus>>>;
	setIdle: Dispatch<SetStateAction<boolean>>;
};

function startDownload({ worker, setManagerState, setDatasetStates, setIdle }: StartDownloadArgs) {
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

export function useDatasetDownloadManager() {
	const [managerState, setManagerState] = useState<DownloadManagerStatus>(
		DownloadManagerStatus.IDLE
	);
	const [datasetStates, setDatasetStates] = useState<Record<string, DatasetStatus>>({});
	const [idle, setIdle] = useState<boolean>(false);
	const [worker] = useState<Geant4Worker>(new Geant4Worker());
	const initCalledRef = useRef(false);

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

		startDownload({ worker, setManagerState, setDatasetStates, setIdle });
	}, [worker, idle]);

	return {
		managerState,
		datasetStates: Object.values(datasetStates),
		startDownload: startDownloadSimple
	};
}
