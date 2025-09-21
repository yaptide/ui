/**
 * Geant4 Worker wrapper for UI
 *
 * Additional credits:
 * - https://github.com/ostatni5
 * - https://github.com/lkwinta
 */

import { StatusState } from '../types/ResponseTypes';
import { Geant4WorkerMessageType } from './Geant4WorkerTypes';

export default class Geant4Worker {
	private worker: Worker | undefined;
	private state = StatusState.PENDING;
	private isInitialized = false;
	private depsLoaded = false;
	private startTime: number | undefined;
	private endTime: number | undefined;

	// To make possible to await calls to this class until
	// worker returns the message, we add a unique index to each worker call,
	// return a promise, storing its resolve() function in resolvers under call id.
	// When there is a status update with known id, we call the associated resolve()
	idx: number = 1;
	resolvers: { [k: number]: (value: any) => void } = {};

	private makePromise(idx: number) {
		return new Promise(resolve => {
			this.resolvers[idx] = resolve;
		});
	}

	private resolvePromiseIfExists(idx: number) {
		if (!this.resolvers.hasOwnProperty(idx)) {
			return;
		}

		this.resolvers[idx](null);
		delete this.resolvers[idx];
	}

	getState() {
		return this.state;
	}

	getStartTime() {
		return this.startTime;
	}

	getEndTime() {
		return this.endTime;
	}

	getRunningTime() {
		if (this.startTime === undefined) {
			return 0;
		}

		if (this.endTime === undefined) {
			return Date.now() - this.startTime;
		}

		return this.endTime - this.startTime;
	}

	private handleStatus(data: any) {
		switch (data) {
			case 'DEPS OK':
				this.depsLoaded = true;

				break;
			default:
				console.log('Status:', data);

				break;
		}

		if (data.idx) {
			this.resolvePromiseIfExists(data.idx);
		}
	}

	init() {
		if (this.worker) {
			throw new Error('init() already called on this object');
		}

		this.worker = new Worker(new URL('./geant4Worker.worker.ts', import.meta.url));

		let promiseIdx = this.idx++;

		this.worker.onmessage = event => {
			switch (event.data.type) {
				case 'init':
					this.isInitialized = true;

					this.resolvePromiseIfExists(promiseIdx);

					break;
				case 'result':
					console.log('Result:', event.data.result);
					this.worker?.terminate();
					this.worker = undefined;
					this.endTime = Date.now();
					this.state = StatusState.COMPLETED;

					break;
				case 'print':
					console.log('From worker: ', event.data.data);

					break;
				case 'status':
					this.handleStatus(event.data.data);

					break;
				case 'error':
					console.error('Error:', event.data.message);

					if (event.data.error) {
						console.error('Error details:', event.data.error);
					}

					break;
				default:
					console.error('Unknown message type:', event.data.type, event.data);
			}
		};

		return this.makePromise(promiseIdx);
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
		this.worker.postMessage({ type: Geant4WorkerMessageType.INIT_DATA_FILES, idx });

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
		this.worker.postMessage({ type: Geant4WorkerMessageType.INIT_LAZY_FILES, idx });

		return this.makePromise(idx);
	}

	includeFile(name: string, data: string) {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		const idx = this.idx++;
		this.worker.postMessage({
			type: Geant4WorkerMessageType.CREATE_FILE,
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
		this.worker.postMessage({ type: Geant4WorkerMessageType.RUN_SIMULATION });
		this.state = StatusState.RUNNING;
		this.startTime = Date.now();
	}
}
