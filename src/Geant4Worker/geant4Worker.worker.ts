/**
 * Geant4 Worker
 */

import Geant4WorkerProcessCallbacks from './Geant4WorkerCallbacks';
import { workerReturnPromise, workerSetOnMessage } from './Geant4WorkerHelpers';
import { Geant4WorkerMessageType, Geant4WorkerPromise } from './Geant4WorkerTypes';

const onMessageFunction = async (event: MessageEvent<Geant4WorkerPromise>) => {
	try {
		const result = await Geant4WorkerProcessCallbacks(event.data.message);
		workerReturnPromise({
			idx: event.data.idx,
			message: {
				type: event.data.message.type,
				data: result
			}
		});
	} catch (error: unknown) {
		const result = error instanceof Error ? error : new Error('Unknown error');
		workerReturnPromise({
			idx: event.data.idx,
			message: {
				type: Geant4WorkerMessageType.ERROR,
				data: result
			}
		});
	}
};

workerSetOnMessage(onMessageFunction);
