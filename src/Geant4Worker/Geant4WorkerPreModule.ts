import { Geant4WorkerDownloadProgressMonitor } from './Geant4WorkerDownloadProgressMonitor';
import { workerPostMessage } from './Geant4WorkerHelpers';
import { Geant4WorkerMessageType, S3_PREFIX_MAP } from './Geant4WorkerTypes';

export class Geant4WorkerPreModule {
	private progressMonitor: Geant4WorkerDownloadProgressMonitor;

	preRun: (() => void)[] = [];
	postRun: (() => void)[] = [];

	constructor(progressMonitor: Geant4WorkerDownloadProgressMonitor) {
		this.progressMonitor = progressMonitor;
	}

	printErr(...args: any[]) {
		const data = args.join('');

		if (data.includes('dependency')) return;

		workerPostMessage({ type: Geant4WorkerMessageType.PRINT_ERROR, data });
	}

	print(...args: any[]) {
		const data = args.join('');
		workerPostMessage({ type: Geant4WorkerMessageType.PRINT, data });
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

		if (ext in S3_PREFIX_MAP) {
			return S3_PREFIX_MAP[ext] + path;
		}

		// otherwise, use the default, the prefix (JS file's dir) + the path
		return prefix + path;
	}
}
