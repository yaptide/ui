/**
 * Geant4 Worker wrapper for UI
 *
 * Additional credits:
 * - https://github.com/ostatni5
 * - https://github.com/lkwinta
 */
import { Geant4WorkerMessageType } from './Geant4WorkerTypes';

export default class Geant4Worker {
	worker: Worker | undefined;
	isInitialized = false;
	done = false;
	depsLoaded = false;
	onDepsLoaded: (() => void) | undefined;

	private handleStatus(data: any) {
		switch (data) {
			case 'DEPS OK':
				this.depsLoaded = true;

				if (this.onDepsLoaded) {
					this.onDepsLoaded();
				}

				break;
			default:
				console.log('Status:', data);

				break;
		}
	}

	init() {
		if (this.worker) {
			throw new Error('init() already called on this object');
		}

		this.worker = new Worker(new URL('./geant4Worker.worker.ts', import.meta.url));

		let initResolver: (value: unknown) => void;

		this.worker.onmessage = event => {
			switch (event.data.type) {
				case 'init':
					this.isInitialized = true;
					initResolver?.(true);

					break;
				case 'result':
					console.log('Result:', event.data.result);
					this.worker?.terminate();
					this.worker = undefined;
					this.done = true;

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

		// wait until "init" message comes back from worker with this simple trick
		return new Promise(resolve => {
			initResolver = resolve;
		});
	}

	async loadDeps() {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		this.worker.postMessage({ type: Geant4WorkerMessageType.INIT_DATA_FILES });
	}

	async loadDepsLazy() {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		this.worker.postMessage({ type: Geant4WorkerMessageType.INIT_LAZY_FILES });
	}

	setOnDepsLoaded(callback: () => void) {
		if (this.depsLoaded) {
			callback();
		} else {
			this.onDepsLoaded = callback;
		}
	}

	includeFile(name: string, data: string) {
		if (!this.worker || !this.isInitialized) {
			console.error('Worker is not initialized. Call init() first.');

			return;
		}

		this.worker.postMessage({
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
		this.worker.postMessage({ type: Geant4WorkerMessageType.RUN_SIMULATION });
	}
}
