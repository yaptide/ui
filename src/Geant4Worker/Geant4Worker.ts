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
	Geant4WorkerMessageType,
	Geant4WorkerPromise
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
	private resolvers: {
		[k: number]: { resolve: (value: any) => void; reject: (reason?: any) => void };
	} = {};

	private makePromise<T>(message: Geant4WorkerMessage) {
		const idx = this.idx++;

		this.workerPostPromise({
			idx,
			message
		});

		return new Promise<T>((resolve, reject) => {
			this.resolvers[idx] = { resolve, reject };
		});
	}

	private resolvePromiseIfExists(promise: Geant4WorkerPromise) {
		if (!promise.idx) {
			return;
		}

		if (!this.resolvers.hasOwnProperty(promise.idx)) {
			return;
		}

		this.resolvers[promise.idx].resolve(promise.message.data);
		delete this.resolvers[promise.idx];
	}

	private rejectPromiseIfExists(promise: Geant4WorkerPromise) {
		if (!promise.idx) {
			return;
		}

		if (!this.resolvers.hasOwnProperty(promise.idx)) {
			return;
		}

		this.resolvers[promise.idx].reject(promise.message.data);
		delete this.resolvers[promise.idx];
	}

	// Helper function for the sake of type safety
	private workerPostMessage(msg: Geant4WorkerMessage) {
		this.workerPostPromise({
			idx: undefined,
			message: msg
		});
	}

	private workerPostPromise(promise: Geant4WorkerPromise) {
		this.worker?.postMessage(promise);
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

	init() {
		if (this.worker) {
			throw new Error('init() already called on this object');
		}

		this.worker = new Worker(new URL('./geant4Worker.worker.ts', import.meta.url));

		this.worker.onmessage = (event: MessageEvent<Geant4WorkerPromise>) => {
			const { message } = event.data;

			switch (message.type) {
				case Geant4WorkerMessageType.PRINT:
					console.log('From worker: ', message.data);

					break;
				case Geant4WorkerMessageType.PRINT_ERROR:
					console.error('From worker: ', message.data);

					break;

				case Geant4WorkerMessageType.DOWNLOAD_STATUS:
					break;
				case Geant4WorkerMessageType.PROGRESS:
					this.simulatedPrimaries = message.data as number;

					break;
				case Geant4WorkerMessageType.ERROR:
					if (message.data) {
						const error = message.data as Error;

						console.error('Error:', error.message);
						console.error('Error details:', error);
					}

					this.endTime = Date.now();
					this.state = StatusState.FAILED;

					this.rejectPromiseIfExists(event.data);
					this.destroy();

					return;
			}

			this.resolvePromiseIfExists(event.data);
		};

		return this.makePromise<void>({ type: Geant4WorkerMessageType.INIT_WASM_MODULE }).then(
			() => {
				this.isInitialized = true;
			}
		);
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

		return this.makePromise<void>({ type: Geant4WorkerMessageType.INIT_DATA_FILES }).then(
			() => {
				this.depsLoaded = true;
			}
		);
	}

	async loadDepsLazy() {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		if (this.depsLoaded) {
			console.error('Deps already loaded');
		}

		return this.makePromise<void>({ type: Geant4WorkerMessageType.INIT_LAZY_FILES }).then(
			() => {
				this.depsLoaded = true;
			}
		);
	}

	async includeFile(name: string, data: string) {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		return await this.makePromise({
			type: Geant4WorkerMessageType.CREATE_FILE,
			data: { name, data }
		});
	}

	async start() {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		// Worker will acknowledge the message and wait for the deps to load
		// no need for additional logic here
		this.state = StatusState.RUNNING;
		this.startTime = Date.now();

		this.makePromise<number>({ type: Geant4WorkerMessageType.SIMULATION }).then(result => {
			this.state = StatusState.COMPLETED;
			this.endTime = Date.now();
			console.log('Simulation completed', result);
		});
	}

	async fetchResultsFile(name: string) {
		if (!this.worker || this.state !== StatusState.COMPLETED) {
			console.error('Worker state is invalid.');

			return;
		}

		const result = await this.makePromise<Geant4WorkerMessageFile>({
			type: Geant4WorkerMessageType.READ_FILE,
			data: name
		}).then(result => {
			console.log(result);

			return result.data;
		});

		return result;
	}
}
