/**
 * Geant4 Worker wrapper for UI
 *
 * Additional credits:
 * - https://github.com/ostatni5
 * - https://github.com/lkwinta
 */

import { JobUnknownStatus, StatusState } from '../types/ResponseTypes';
import {
	Geant4WorkerMessage,
	Geant4WorkerMessageFile,
	Geant4WorkerReceiveMessageType,
	Geant4WorkerSendMessageType
} from './Geant4WorkerTypes';

export default class Geant4Worker {
	private worker: Worker | undefined;
	private state: JobUnknownStatus['jobState'] = StatusState.PENDING;
	private isInitialized = false;
	private depsLoaded = false;
	private startTime: number = Date.now();
	private endTime: number | null = null;
	private simulatedPrimaries: number = 0;

	// To make possible to await calls to this class until
	// worker returns the message, we add a unique index to each worker call,
	// return a promise, storing its resolve() function in resolvers under call id.
	// When there is a status update with known id, we call the associated resolve()
	private idx: number = 1;
	private resolvers: { [k: number]: (value: any) => void } = {};

	private makePromise<T>(idx: number) {
		return new Promise<T>(resolve => {
			this.resolvers[idx] = resolve;
		});
	}

	private resolvePromiseIfExists(idx: number, value: any) {
		if (!this.resolvers.hasOwnProperty(idx)) {
			return;
		}

		this.resolvers[idx](value);
		delete this.resolvers[idx];
	}

	getState() {
		return this.state;
	}

	getStartTime() {
		return new Date(this.startTime).toISOString();
	}

	getEndTime() {
		return this.endTime ? new Date(this.endTime).toISOString() : null;
	}

	getSimulatedPrimaries() {
		return this.simulatedPrimaries;
	}

	// Helper function for the sake of type safety
	workerPostMessage(msg: Geant4WorkerMessage<Geant4WorkerReceiveMessageType>) {
		this.worker?.postMessage(msg);
	}

	init() {
		if (this.worker) {
			throw new Error('init() already called on this object');
		}

		this.worker = new Worker(new URL('./geant4Worker.worker.ts', import.meta.url));

		let promiseIdx = this.idx++;

		this.worker.onmessage = (
			event: MessageEvent<Geant4WorkerMessage<Geant4WorkerSendMessageType>>
		) => {
			switch (event.data.type) {
				case Geant4WorkerSendMessageType.WASM_INITIALIZED:
					this.isInitialized = true;

					this.resolvePromiseIfExists(promiseIdx, null);

					break;
				case Geant4WorkerSendMessageType.RESULT:
					console.log('Result:', event.data.data);
					this.endTime = Date.now();
					this.state = StatusState.COMPLETED;

					break;
				case Geant4WorkerSendMessageType.PRINT:
					console.log('From worker: ', event.data.data);

					break;
				case Geant4WorkerSendMessageType.PRINT_ERROR:
					console.error('From worker: ', event.data.data);

					break;

				case Geant4WorkerSendMessageType.DOWNLOAD_STATUS:
					// TODO: download status message handling

					if (event.data.idx) {
						this.resolvePromiseIfExists(event.data.idx, null);
					}

					break;
				case Geant4WorkerSendMessageType.PROGRESS:
					this.simulatedPrimaries = event.data.data as number;

					break;
				case Geant4WorkerSendMessageType.ERROR:
					if (event.data) {
						const error = event.data.data as Error;

						console.error('Error:', error.message);
						console.error('Error details:', error);
					}

					this.endTime = Date.now();
					this.state = StatusState.FAILED;
					this.destroy();

					break;
				case Geant4WorkerSendMessageType.FILE_CONTENT:
					if (event.data.idx) {
						this.resolvePromiseIfExists(
							event.data.idx,
							(event.data.data as Geant4WorkerMessageFile).data
						);
					}

					break;
				case Geant4WorkerSendMessageType.CREATE_FILE_ACK:
					if (event.data.idx) {
						this.resolvePromiseIfExists(event.data.idx, null);
					}

					break;
				default:
					console.error('Unknown message type:', event.data.type, event.data);
			}
		};

		return this.makePromise(promiseIdx);
	}

	destroy() {
		this.worker?.terminate();
		this.worker = undefined;
	}

	async loadDeps() {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		if (this.depsLoaded) {
			console.error('Deps already loaded');
		}

		const idx = this.idx++;
		this.workerPostMessage({ type: Geant4WorkerReceiveMessageType.INIT_DATA_FILES, idx });

		return this.makePromise(idx);
	}

	async loadDepsLazy() {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		if (this.depsLoaded) {
			console.error('Deps already loaded');
		}

		const idx = this.idx++;
		this.workerPostMessage({ type: Geant4WorkerReceiveMessageType.INIT_LAZY_FILES, idx });

		return this.makePromise(idx);
	}

	includeFile(name: string, data: string) {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		const idx = this.idx++;
		this.workerPostMessage({
			type: Geant4WorkerReceiveMessageType.CREATE_FILE,
			data: { name, data },
			idx
		});

		return this.makePromise(idx);
	}

	async start() {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		// Worker will acknowledge the message and wait for the deps to load
		// no need for additional logic here
		this.workerPostMessage({ type: Geant4WorkerReceiveMessageType.RUN_SIMULATION });
		this.state = StatusState.RUNNING;
		this.startTime = Date.now();
	}

	async fetchResultsFile(name: string) {
		if (!this.worker || this.state !== StatusState.COMPLETED) {
			console.error('Worker state is invalid.');

			return;
		}

		const idx = this.idx++;
		this.workerPostMessage({ type: Geant4WorkerReceiveMessageType.READ_FILE, data: name, idx });

		return this.makePromise<string>(idx);
	}
}
