import { Geant4WorkerDatasetProgress } from './Geant4WorkerTypes';

type DatasetProgress = Geant4WorkerDatasetProgress & { totalDependencies: number };

export class Geant4WorkerDownloadProgressMonitor {
	private datasetsProgressTracker: { [key: string]: DatasetProgress } = {};
	private currentDataset?: string;
	private downloadOffset: number = 0;
	private downloadCurrentTotal: number = 0;

	reset() {
		this.datasetsProgressTracker = {};
		this.currentDataset = undefined;
		this.downloadOffset = 0;
		this.downloadCurrentTotal = 0;
	}

	setCurrentDataset(dataset: string) {
		this.datasetsProgressTracker[dataset] = {
			stage: 'downloading',
			progress: 0,
			totalDependencies: 0
		};

		this.downloadOffset = this.downloadCurrentTotal;
		this.currentDataset = dataset;
	}

	setDownloadProgress(loaded: number, total: number) {
		if (!this.currentDataset) {
			return;
		}

		const datasetProgress = this.datasetsProgressTracker[this.currentDataset];

		if (datasetProgress) {
			if (datasetProgress.stage === 'done') {
				return;
			}

			datasetProgress.stage = 'downloading';
			datasetProgress.progress =
				total - this.downloadOffset === 0
					? 1
					: (loaded - this.downloadOffset) / (total - this.downloadOffset);
			this.downloadCurrentTotal = Math.max(this.downloadCurrentTotal, total);
		}
	}

	setPreparationProgress(left: number) {
		if (!this.currentDataset) {
			return;
		}

		const datasetProgress = this.datasetsProgressTracker[this.currentDataset];

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

	getOverallProgress(): Record<string, Geant4WorkerDatasetProgress> {
		return Object.fromEntries(
			Object.entries(this.datasetsProgressTracker).map(([dataset, progress]) => [
				dataset,
				{
					stage: progress.stage,
					progress: progress.progress
				}
			])
		);
	}
}
