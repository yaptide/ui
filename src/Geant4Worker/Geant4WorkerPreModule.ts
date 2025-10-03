import { Geant4WorkerDownloadProgressMonitor } from './Geant4WorkerDownloadProgressMonitor';
import { workerPostMessage } from './Geant4WorkerHelpers';
import { Geant4WorkerSendMessageType } from './Geant4WorkerTypes';

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
		const data = [...Array.prototype.slice.call(arguments)].join('');
		workerPostMessage({ type: Geant4WorkerSendMessageType.PRINT_ERROR, data });
	}

	print() {
		const data = [...Array.prototype.slice.call(arguments)].join('');
		workerPostMessage({ type: Geant4WorkerSendMessageType.PRINT, data });
	}

	setStatus(text: string) {
		// Try parsing "text" to find "(x/y)" pattern
		console.log('Status:', text);
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
