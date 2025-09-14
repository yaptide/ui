import { useCallback, useEffect, useState } from 'react';

export enum DownloadManagerStatus {
	IDLE,
	WORKING,
	FINISHED,
	ERROR,
}

export enum DatasetDownloadStatus {
	IDLE,
	DOWNLOADING,
	PROCESSING,
	DONE,
}

export interface DatasetStatus {
	name: string,
	status: DatasetDownloadStatus,
	done?: number,
	total?: number,
}

const downloadRegex = /Downloading data... \((\d+)\/(\d+)\)/g;
const processingRegex = /Processing... \((\d+)\/(\d+)\)/g;

export function useDatasetDownloadManager() {
	const [managerState, setManagerState] = useState<DownloadManagerStatus>(DownloadManagerStatus.IDLE);
	const [datasetStates, setDatasetStates] = useState<Record<string, DatasetStatus>>({});
	const [dataset, setDataset] = useState<string | undefined>();
	const [idle, setIdle] = useState<boolean>(true);
	const [worker, setWorker] = useState<Worker>();

	const startDownload = useCallback(
		idle
			? () => {
				worker?.postMessage({ type: 'loadDepsData' });
				setManagerState(DownloadManagerStatus.WORKING);
				setIdle(false);
			}
			: () => {},
		[worker, idle],
	);

	useEffect(() => {
		const worker = new Worker(new URL('./geantWorker.worker.ts', import.meta.url));
		let done = '', total = '';
		worker.onmessage = (event) => {
			switch (event.data.type) {
				case 'status':
					switch (true) {
						case event.data.data?.startsWith('Name'):
							if (dataset) {
								setDatasetStates(states => ({
									...states,
									[dataset]: { name: dataset, status: DatasetDownloadStatus.DONE }
								}));
							}
							const name = event.data.data.slice(6, -1);
							setDataset(name);
							setDatasetStates(states => ({
								...states,
								[name]: { name, status: DatasetDownloadStatus.IDLE }
							}));
							break;
						case event.data.data?.startsWith('Downloading data'):
							[, done, total] = Array.from(event.data.data.matchAll(downloadRegex))[0] as string[];
							setDatasetStates(states => ({
								...states,
								[dataset!]: {
									name: dataset!,
									status: DatasetDownloadStatus.DOWNLOADING,
									done: parseInt(done),
									total: parseInt(total)
								}
							}));
							break;
						case event.data.data?.startsWith('Processing'):
							[, done, total] = Array.from(event.data.data.matchAll(processingRegex))[0] as string[];
							setDatasetStates(states => ({
								...states,
								[dataset!]: {
									name: dataset!,
									status: DatasetDownloadStatus.PROCESSING,
									done: parseInt(done),
									total: parseInt(total)
								}
							}));
							break;
						case event.data.data?.startsWith('Datasets initialized'):
							setManagerState(DownloadManagerStatus.FINISHED);
							break;
						default:
							console.log('Status: ', event.data.data);
							if (dataset) {
								setDatasetStates(states => ({
									...states,
									[dataset!]: { name: dataset!, status: DatasetDownloadStatus.IDLE }
								}));
							}
							break;
					}
					break;
				case 'error':
					setManagerState(DownloadManagerStatus.ERROR);
					break;
			}
		};
		setWorker(worker);
	}, []);

	return { managerState, datasetStates: Object.values(datasetStates), startDownload };
}