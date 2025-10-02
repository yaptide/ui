import {
	Geant4WorkerMessage,
	Geant4WorkerReceiveMessageType,
	Geant4WorkerSendMessageType
} from './Geant4WorkerTypes';

// TypeScript type assertion to treat self as a Worker
const ctx = self as unknown as Worker; // eslint-disable-line no-restricted-globals

// Helper function for the sake of type safety
export function workerPostMessage(message: Geant4WorkerMessage<Geant4WorkerSendMessageType>) {
	ctx.postMessage(message);
}

export function workerSetOnMessage(
	handler: (
		event: MessageEvent<Geant4WorkerMessage<Geant4WorkerReceiveMessageType>>
	) => Promise<void>
) {
	ctx.onmessage = handler;
}
