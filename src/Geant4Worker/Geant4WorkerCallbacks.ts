import { MainModule } from '../libs/geant-web-stubs/geant4_wasm';
import { default as initG4EMLOW } from '../libs/geant-web-stubs/preload/preload_G4EMLOW8.6.1';
import { default as initG4ENSDFSTATE } from '../libs/geant-web-stubs/preload/preload_G4ENSDFSTATE3.0';
import { default as initG4NDL } from '../libs/geant-web-stubs/preload/preload_G4NDL4.7.1';
import { default as initG4PARTICLEXS } from '../libs/geant-web-stubs/preload/preload_G4PARTICLEXS4.1';
import { default as initG4SAIDDATA } from '../libs/geant-web-stubs/preload/preload_G4SAIDDATA2.0';
import { default as initPhotoEvaporation } from '../libs/geant-web-stubs/preload/preload_PhotonEvaporation6.1';
import { Geant4WorkerDownloadProgressMonitor } from './Geant4WorkerDownloadProgressMonitor';
import { workerPostMessage, workerRespond } from './Geant4WorkerHelpers';
import {
	Geant4WorkerMessage,
	Geant4WorkerMessageFile,
	Geant4WorkerMessagePayload,
	Geant4WorkerReceiveMessageType,
	Geant4WorkerSendMessageType
} from './Geant4WorkerTypes';

type Geant4WorkerCallbackArgs = {
	event: MessageEvent<Geant4WorkerMessage<Geant4WorkerReceiveMessageType>>;
	wasmModule: Promise<MainModule>;
	downloadTracker: Geant4WorkerDownloadProgressMonitor;
};
type Geant4WorkerCallbacksType = (
	args: Geant4WorkerCallbackArgs
) => Promise<Geant4WorkerMessagePayload>;

// Files passed in from UI
// A .gdml file and a .mac file is required to run the simulation
let includedFiles: string[] = [];

const initDatasets: Geant4WorkerCallbacksType = async args => {
	const { wasmModule, downloadTracker } = args;
	// Download the whole dataset at once (roughly 2GB of data).
	// After each of 6 datasets is processed, it should be cached
	// and other workers should be able to access the data without downloading again.
	// This, in theory, could enable the app to run offline.
	await wasmModule.then(async module => {
		try {
			downloadTracker.setCurrentDataset('G4ENSDFSTATE');
			await initG4ENSDFSTATE(module);
			downloadTracker.setCurrentDataset('G4EMLOW');
			await initG4EMLOW(module);
			downloadTracker.setCurrentDataset('G4NDL');
			await initG4NDL(module);
			downloadTracker.setCurrentDataset('G4PARTICLEXS');
			await initG4PARTICLEXS(module);
			downloadTracker.setCurrentDataset('G4SAIDDATA');
			await initG4SAIDDATA(module);
			downloadTracker.setCurrentDataset('PhotonEvaporation');
			await initPhotoEvaporation(module);
		} catch (error: unknown) {
			console.error('Error initializing lazy files:', (error as Error).message);

			return Promise.reject(error);
		}
	});
};

const initLazyFiles: Geant4WorkerCallbacksType = async args => {
	// Initialize lazy download. Files needed for specific simulation are downloaded on-demand.
	// Best-case scenario - the download size is reduced to a couple of kb.

	const { wasmModule } = args;

	await wasmModule.then(async module => {
		module.FS_createPath('/', 'data', true, true);
		module.FS_createPath('/data', 'G4EMLOW8.6.1', true, true);
		module.FS_createPath('/data', 'G4ENSDFSTATE3.0', true, true);
		module.FS_createPath('/data', 'G4NDL4.7.1', true, true);
		module.FS_createPath('/data', 'G4PARTICLEXS4.1', true, true);
		module.FS_createPath('/data', 'G4SAIDDATA2.0', true, true);
		module.FS_createPath('/data', 'PhotonEvaporation6.1', true, true);

		const jsonFiles = [
			'load_G4EMLOW8.6.1.json',
			'load_G4ENSDFSTATE3.0.json',
			'load_G4NDL4.7.1.json',
			'load_G4PARTICLEXS4.1.json',
			'load_G4SAIDDATA2.0.json',
			'load_PhotonEvaporation6.1.json'
		];

		for (const jsonFile of jsonFiles) {
			const path = S3_PREFIX_MAP['.json'] + jsonFile;
			await fetch(path)
				.then(response => {
					if (!response.ok) {
						throw new Error('HTTP error ' + response.status);
					}

					return response.json();
				})
				.then(data => {
					// @ts-ignore
					for (const file of data) {
						if (file.type === 'file') {
							module.FS_createLazyFile(file.parent, file.name, file.url, true, true);
						} else if (file.type === 'path') {
							module.FS_createPath(file.parent, file.name, true, true);
						}
					}
				});
		}
	});
};

const createFile: Geant4WorkerCallbacksType = async args => {
	const { event, wasmModule } = args;

	await wasmModule.then(module => {
		const data = event.data.data as Geant4WorkerMessageFile;

		module.FS.createFile('/', data.name, null, true, true);
		module.FS.writeFile(data.name, data.data);
		includedFiles.push(data.name);
	});
};

const readFile: Geant4WorkerCallbacksType = async args => {
	const { event, wasmModule } = args;

	return wasmModule.then(module => {
		const fileName = event.data.data as string;

		// 'as unknown as string' because TS doesn't know that when encoding is utf8, a string is returned
		const fileContent = module.FS.readFile(fileName, {
			encoding: 'utf8'
		}) as unknown as string;

		return {
			name: fileName,
			data: fileContent
		};
	});
};

const runSimulation: Geant4WorkerCallbacksType = async args => {
	const { event, wasmModule } = args;

	const geometryDefinition = includedFiles.find(k => k.endsWith('.gdml'));
	const macroFile = includedFiles.find(k => k.endsWith('.mac'));

	if (!geometryDefinition || !macroFile) {
		throw new Error('.gdml and .mac file are required');
	}

	try {
		const result = await wasmModule.then(module => {
			const progressCallback = (progress: number) => {
				workerPostMessage({
					type: Geant4WorkerSendMessageType.PROGRESS,
					data: progress
				});
			};

			const progressCallbackPtr = module.addFunction(progressCallback, 'vi');
			module.Geant4SetProgressFunction(progressCallbackPtr);

			return module.Geant4GDMRun(geometryDefinition, macroFile);
		});

		return result;
	} catch (error: unknown) {
		return Promise.reject(error);
	}
};

const pollDatasetProgress: Geant4WorkerCallbacksType = async args => {
	const { downloadTracker } = args;

	const progress = downloadTracker.getOverallProgress();

	return progress;
};

const callbacks: Record<Geant4WorkerReceiveMessageType, Geant4WorkerCallbacksType> = {
	[Geant4WorkerReceiveMessageType.INIT_DATA_FILES]: initDatasets,
	[Geant4WorkerReceiveMessageType.INIT_LAZY_FILES]: initLazyFiles,
	[Geant4WorkerReceiveMessageType.CREATE_FILE]: createFile,
	[Geant4WorkerReceiveMessageType.READ_FILE]: readFile,
	[Geant4WorkerReceiveMessageType.RUN_SIMULATION]: runSimulation,
	[Geant4WorkerReceiveMessageType.POLL_DATASET_PROGRESS]: pollDatasetProgress
};

export default function Geant4WorkerProcessCallbacks(args: Geant4WorkerCallbackArgs) {
	const { event } = args;

	const callback = callbacks[event.data.type!];

	if (callback) {
		callback(args).then(data => {
			workerRespond({
				idx: event.data.idx,
				type: event.data.type!,
				message: data
			});
		});
	}

	throw new Error(`Unknown message type: ${event.data.type}`);
}
