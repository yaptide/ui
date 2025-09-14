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

const idleRegex = /IDLE \((\w+)\)/g;
const downloadEndRegex = /END DL \((\w+)\)/g;
const downloadRegex = /DL \((\w+)\) \((\d+)\/(\d+)\)/g;
const processingRegex = /PROCESS \((\d+)\/(\d+)\)/g;

export function useDatasetDownloadManager() {
	const [managerState, setManagerState] = useState<DownloadManagerStatus>(DownloadManagerStatus.IDLE);
	const [datasetStates, setDatasetStates] = useState<Record<string, DatasetStatus>>({});
	const [processingState, setProcessingState] = useState<DatasetStatus | undefined>(undefined);
	const [idle, setIdle] = useState<boolean>(true);
	const [worker, setWorker] = useState<Worker>();

	const startDownload = useCallback(
		idle
			? () => {
				worker?.postMessage({ type: 'loadDepsData' });
				setProcessingState({ name: 'Processing downloaded files', status: DatasetDownloadStatus.PROCESSING, done: 0, total: 1 });
				setManagerState(DownloadManagerStatus.WORKING);
				setIdle(false);
			}
			: () => {},
		[worker, idle],
	);

	useEffect(() => {
		setWorker(new Worker(new URL('./geantWorker.worker.ts', import.meta.url)));
	}, []);

	useEffect(() => {
		let done = '', total = '', dataset = '';
		const handler = (event: MessageEvent) => {
			switch (event.data.type) {
				case 'status':
					switch (true) {
						case event.data.data?.startsWith('IDLE'):
							[, dataset] = Array.from(event.data.data.matchAll(idleRegex))[0] as string[];
							setDatasetStates(states => ({
								...states,
								[dataset]: {
									name: dataset,
									status: states[dataset] ? states[dataset].status : DatasetDownloadStatus.IDLE,
								}
							}));
							break;
						case event.data.data?.startsWith('DL'):
							[, dataset, done, total] = Array.from(event.data.data.matchAll(downloadRegex))[0] as string[];
							setDatasetStates(states => ({
								...states,
								[dataset]: {
									name: dataset,
									status: DatasetDownloadStatus.DOWNLOADING,
									done: parseInt(done),
									total: parseInt(total)
								}
							}));
							break;
						case event.data.data?.startsWith('END DL'):
							[, dataset] = Array.from(event.data.data.matchAll(downloadEndRegex))[0] as string[];
							console.log('end dl', dataset);
							setDatasetStates(states => ({
								...states,
								[dataset]: {
									name: dataset,
									status: DatasetDownloadStatus.DONE,
									done: parseInt(done),
									total: parseInt(total)
								}
							}));
							break;
						case event.data.data?.startsWith('PROCESS'):
							[, done, total] = Array.from(event.data.data.matchAll(processingRegex))[0] as string[];
							setProcessingState({
								name: 'Processing downloaded files',
								status: DatasetDownloadStatus.PROCESSING,
								done: parseInt(done),
								total: parseInt(total)
							})
							break;
						case event.data.data?.startsWith('INIT END'):
							setManagerState(DownloadManagerStatus.FINISHED);
							setDatasetStates(states => Object.fromEntries(Object.entries(states).map(([k, v], _) => [k, { ...v, status: DatasetDownloadStatus.DONE }])));
							setProcessingState({ name: 'Processing downloaded files', status: DatasetDownloadStatus.DONE });
							break;
					}
					break;
				case 'error':
					setManagerState(DownloadManagerStatus.ERROR);
					break;
			}
		};
		worker?.addEventListener('message', handler);
		return () => worker?.removeEventListener('message', handler);
	}, [worker]);

	let allStates = Object.values(datasetStates);
	if (processingState) {
		allStates.push(processingState);
	}

	return { managerState, datasetStates: allStates, startDownload };
}