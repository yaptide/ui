/**
 * Geant4 Worker
 */

import Geant4WorkerProcessCallbacks from './Geant4WorkerCallbacks';
import { workerResolvePromise, workerSetOnMessage } from './Geant4WorkerHelpers';
import { Geant4WorkerPromise } from './Geant4WorkerTypes';

const onMessageFunction = async (event: MessageEvent<Geant4WorkerPromise>) => {
	const result = await Geant4WorkerProcessCallbacks(event.data.message);

	workerResolvePromise({
		idx: event.data.idx,
		message: {
			type: event.data.message.type,
			data: result
		}
	});
};

workerSetOnMessage(onMessageFunction);
