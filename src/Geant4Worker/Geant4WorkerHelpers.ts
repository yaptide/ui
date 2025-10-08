import { Geant4WorkerMessage, Geant4WorkerPromise } from './Geant4WorkerTypes';

// TypeScript type assertion to treat self as a Worker
const ctx = self as unknown as Worker; // eslint-disable-line no-restricted-globals

// Helper function for the sake of type safety
export function workerPostMessage(message: Geant4WorkerMessage) {
	ctx.postMessage({
		idx: undefined,
		message: message
	} as Geant4WorkerPromise);
}

export function workerResolvePromise(promise: Geant4WorkerPromise) {
	ctx.postMessage(promise);
}

export function workerSetOnMessage(
	handler: (event: MessageEvent<Geant4WorkerPromise>) => Promise<void>
) {
	ctx.onmessage = handler;
}
