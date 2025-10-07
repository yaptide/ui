import {
	Geant4WorkerMessage,
	Geant4WorkerMessageType,
	Geant4WorkerPromise
} from './Geant4WorkerTypes';

// TypeScript type assertion to treat self as a Worker
const ctx = self as unknown as Worker; // eslint-disable-line no-restricted-globals

// Helper function for the sake of type safety
export function workerPostMessage(message: Geant4WorkerMessage<Geant4WorkerMessageType>) {
	ctx.postMessage(message);
}

export function workerSetOnMessage(
	handler: (event: MessageEvent<Geant4WorkerMessage<Geant4WorkerMessageType>>) => Promise<void>
) {
	ctx.onmessage = handler;
}
