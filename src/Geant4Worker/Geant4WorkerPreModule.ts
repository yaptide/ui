import { workerPostMessage } from './Geant4WorkerHelpers';
import { Geant4WorkerDatasetProgress, Geant4WorkerSendMessageType } from './Geant4WorkerTypes';

type DatasetProgress = Geant4WorkerDatasetProgress & { totalDependencies: number };

export class Geant4WorkerDownloadProgressMonitor {
	private datasetsProgressTracker: { [key: string]: DatasetProgress } = {};
	private currentDataset?: string;

	setCurrentDataset(dataset: string) {
		this.datasetsProgressTracker[dataset] = {
			stage: 'downloading',
			progress: 0,
			totalDependencies: 0
		};

		this.currentDataset = dataset;
	}

	setDownloadProgress(progress: number) {
		if (this.currentDataset === undefined) {
			return;
		}

		const datasetProgress = this.datasetsProgressTracker[this.currentDataset!];

		if (datasetProgress) {
			if (datasetProgress.stage === 'done') {
				return;
			}

			datasetProgress.progress = progress;
		}
	}

	setPreparationProgress(left: number) {
		if (this.currentDataset === undefined) {
			return;
		}

		const datasetProgress = this.datasetsProgressTracker[this.currentDataset!];

		if (datasetProgress) {
			if (datasetProgress.stage === 'done') {
				return;
			}

			datasetProgress.stage = 'preparing';
			datasetProgress.totalDependencies = Math.max(datasetProgress.totalDependencies, left);
			datasetProgress.progress =
				(datasetProgress.totalDependencies - left) / datasetProgress.totalDependencies;

			if (left === 0) {
				datasetProgress.progress = 1;
				datasetProgress.stage = 'done';
			}
		}
	}

	getOverallProgress(dataset: string): Geant4WorkerDatasetProgress | undefined {
		const progress = this.datasetsProgressTracker[dataset];

		if (progress) {
			return {
				stage: progress.stage,
				progress: progress.progress
			};
		}
	}
}

export class Geant4WorkerPreModule {
	private progressMonitor: Geant4WorkerDownloadProgressMonitor;
	private s3PrefixMap: Record<string, string>;

	preRun: (() => void)[] = [];
	postRun: (() => void)[] = [];

	constructor(
		progressMonitor: Geant4WorkerDownloadProgressMonitor,
		s3PrefixMap: Record<string, string>
	) {
		this.progressMonitor = progressMonitor;
		this.s3PrefixMap = s3PrefixMap;
	}

	onRuntimeInitialized() {
		workerPostMessage({
			type: Geant4WorkerSendMessageType.WASM_INITIALIZED
		});
	}

	printErr() {
		return function (text: any) {
			const data = [...Array.prototype.slice.call(arguments)].join('');
			workerPostMessage({ type: Geant4WorkerSendMessageType.PRINT_ERROR, data });
		};
	}

	print() {
		return function (text: any) {
			const data = [...Array.prototype.slice.call(arguments)].join('');
			workerPostMessage({ type: Geant4WorkerSendMessageType.PRINT, data });
		};
	}

	setStatus(text: string) {
		// Try parsing "text" to find "(x/y)" pattern

		const match = text.match(/\((\d+)\/(\d+)\)/);

		if (match) {
			const current = parseInt(match[1], 10);
			const total = parseInt(match[2], 10);

			const progress = current / total;

			this.progressMonitor.setDownloadProgress(progress);
		}
	}

	monitorRunDependencies(left: number) {
		this.progressMonitor.setPreparationProgress(left);
	}

	locateFile(path: any, prefix: any) {
		// if it's a mem init file, use a custom dir
		const ext = path.slice(path.lastIndexOf('.'));

		if (ext in this.s3PrefixMap) {
			return this.s3PrefixMap[ext] + path;
		}

		// otherwise, use the default, the prefix (JS file's dir) + the path
		return prefix + path;
	}
}
