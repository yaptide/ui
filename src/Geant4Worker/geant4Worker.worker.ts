/**
 * Geant4 Worker
 */

import createMainModule from '../libs/geant-web-stubs/geant4_wasm';
import { Geant4WorkerDownloadProgressMonitor } from './Geant4WorkerDownloadProgressMonitor';
import { workerPostMessage, workerSetOnMessage } from './Geant4WorkerHelpers';
import { Geant4WorkerPreModule } from './Geant4WorkerPreModule';
import {
	Geant4WorkerMessage,
	Geant4WorkerMessageFile,
	Geant4WorkerReceiveMessageType,
	Geant4WorkerSendMessageType
} from './Geant4WorkerTypes';

const S3_PREFIX_MAP: Record<string, string> = {
	'.wasm': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/',
	'.data': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/',
	'.metadata': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/',
	'.json': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/lazy_files_metadata/'
};

const downloadTracker = new Geant4WorkerDownloadProgressMonitor();
const preMod = new Geant4WorkerPreModule(downloadTracker, S3_PREFIX_MAP);

const mod = createMainModule(preMod);

const onMessageFunction = async (
	event: MessageEvent<Geant4WorkerMessage<Geant4WorkerReceiveMessageType>>
) => {
	switch (event.data.type) {
		default:
			console.error('Unknown message type:', event.data.type);
	}
};

workerSetOnMessage(onMessageFunction);
