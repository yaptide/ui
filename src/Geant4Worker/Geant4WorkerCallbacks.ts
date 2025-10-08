import createMainModule, { MainModule } from '../libs/geant-web-stubs/geant4_wasm';
import { default as initG4EMLOW } from '../libs/geant-web-stubs/preload/preload_G4EMLOW8.6.1';
import { default as initG4ENSDFSTATE } from '../libs/geant-web-stubs/preload/preload_G4ENSDFSTATE3.0';
import { default as initG4NDL } from '../libs/geant-web-stubs/preload/preload_G4NDL4.7.1';
import { default as initG4PARTICLEXS } from '../libs/geant-web-stubs/preload/preload_G4PARTICLEXS4.1';
import { default as initG4SAIDDATA } from '../libs/geant-web-stubs/preload/preload_G4SAIDDATA2.0';
import { default as initPhotoEvaporation } from '../libs/geant-web-stubs/preload/preload_PhotonEvaporation6.1';
import { Geant4WorkerDownloadProgressMonitor } from './Geant4WorkerDownloadProgressMonitor';
import { workerPostMessage } from './Geant4WorkerHelpers';
import { Geant4WorkerPreModule } from './Geant4WorkerPreModule';
import {
	Geant4WorkerMessage,
	Geant4WorkerMessageFile,
	Geant4WorkerMessagePayload,
	Geant4WorkerMessageType,
	S3_JSON_FILES,
	S3_PREFIX_MAP
} from './Geant4WorkerTypes';

type Geant4WorkerCallbackArgs = {
	payload: Geant4WorkerMessage;
	wasmModule: MainModule;
	downloadTracker: Geant4WorkerDownloadProgressMonitor;
};
type Geant4WorkerCallbacksType = (
	args: Geant4WorkerCallbackArgs
) => Promise<Geant4WorkerMessagePayload>;

// Files passed in from UI
// A .gdml file and a .mac file is required to run the simulation
let includedFiles: string[] = [];
const downloadTracker = new Geant4WorkerDownloadProgressMonitor();

const modulePrefabricate = new Geant4WorkerPreModule(downloadTracker);
let wasmModule: MainModule | undefined;

const initWasmModule = async () => {
	wasmModule = await createMainModule(modulePrefabricate);
};

const initDatasets: Geant4WorkerCallbacksType = async args => {
	const { wasmModule, downloadTracker } = args;

	// Download the whole dataset at once (roughly 2GB of data).
	// After each of 6 datasets is processed, it should be cached
	// and other workers should be able to access the data without downloading again.
	// This, in theory, could enable the app to run offline.
	try {
		downloadTracker.setCurrentDataset('G4ENSDFSTATE');
		await initG4ENSDFSTATE(wasmModule);
		downloadTracker.setCurrentDataset('G4EMLOW');
		await initG4EMLOW(wasmModule);
		downloadTracker.setCurrentDataset('G4NDL');
		await initG4NDL(wasmModule);
		downloadTracker.setCurrentDataset('G4PARTICLEXS');
		await initG4PARTICLEXS(wasmModule);
		downloadTracker.setCurrentDataset('G4SAIDDATA');
		await initG4SAIDDATA(wasmModule);
		downloadTracker.setCurrentDataset('PhotonEvaporation');
		await initPhotoEvaporation(wasmModule);
	} catch (error: unknown) {
		console.error('Error initializing lazy files:', (error as Error).message);

		return Promise.reject(error);
	}
};

const initLazyFiles: Geant4WorkerCallbacksType = async args => {
	// Initialize lazy download. Files needed for specific simulation are downloaded on-demand.
	// Best-case scenario - the download size is reduced to a couple of kb.

	const { wasmModule } = args;

	wasmModule.FS_createPath('/', 'data', true, true);
	wasmModule.FS_createPath('/data', 'G4EMLOW8.6.1', true, true);
	wasmModule.FS_createPath('/data', 'G4ENSDFSTATE3.0', true, true);
	wasmModule.FS_createPath('/data', 'G4NDL4.7.1', true, true);
	wasmModule.FS_createPath('/data', 'G4PARTICLEXS4.1', true, true);
	wasmModule.FS_createPath('/data', 'G4SAIDDATA2.0', true, true);
	wasmModule.FS_createPath('/data', 'PhotonEvaporation6.1', true, true);

	for (const jsonFile of S3_JSON_FILES) {
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
						wasmModule.FS_createLazyFile(file.parent, file.name, file.url, true, true);
					} else if (file.type === 'path') {
						wasmModule.FS_createPath(file.parent, file.name, true, true);
					}
				}
			});
	}
};

const createFile: Geant4WorkerCallbacksType = async args => {
	const { payload, wasmModule } = args;

	const data = payload.data as Geant4WorkerMessageFile;

	wasmModule.FS.createFile('/', data.name, null, true, true);
	wasmModule.FS.writeFile(data.name, data.data);
	includedFiles.push(data.name);
};

const readFile: Geant4WorkerCallbacksType = async args => {
	const { payload, wasmModule } = args;

	const fileName = payload.data as string;

	// 'as unknown as string' because TS doesn't know that when encoding is utf8, a string is returned
	const fileContent = wasmModule.FS.readFile(fileName, {
		encoding: 'utf8'
	}) as unknown as string;

	console.warn('Read file:', fileName, fileContent.length, 'bytes');

	return {
		name: fileName,
		data: fileContent
	};
};

const runSimulation: Geant4WorkerCallbacksType = async args => {
	const { wasmModule } = args;

	const geometryDefinition = includedFiles.find(k => k.endsWith('.gdml'));
	const macroFile = includedFiles.find(k => k.endsWith('.mac'));

	if (!geometryDefinition || !macroFile) {
		throw new Error('.gdml and .mac file are required');
	}

	try {
		const progressCallback = (progress: number) => {
			workerPostMessage({
				type: Geant4WorkerMessageType.PROGRESS,
				data: progress
			});
		};

		const progressCallbackPtr = wasmModule.addFunction(progressCallback, 'vi');
		wasmModule.Geant4SetProgressFunction(progressCallbackPtr);

		return wasmModule.Geant4GDMRun(geometryDefinition, macroFile);
	} catch (error: unknown) {
		return Promise.reject(error);
	}
};

const pollDatasetProgress: Geant4WorkerCallbacksType = async args => {
	const { downloadTracker } = args;

	const progress = downloadTracker.getOverallProgress();

	return progress;
};

const callbacks: Map<Geant4WorkerMessageType, Geant4WorkerCallbacksType> = new Map([
	[Geant4WorkerMessageType.INIT_WASM_MODULE, initWasmModule],
	[Geant4WorkerMessageType.INIT_DATA_FILES, initDatasets],
	[Geant4WorkerMessageType.INIT_LAZY_FILES, initLazyFiles],
	[Geant4WorkerMessageType.CREATE_FILE, createFile],
	[Geant4WorkerMessageType.READ_FILE, readFile],
	[Geant4WorkerMessageType.SIMULATION, runSimulation],
	[Geant4WorkerMessageType.POLL_DATASET_PROGRESS, pollDatasetProgress]
]);

export default async function Geant4WorkerProcessCallbacks(payload: Geant4WorkerMessage) {
	const callback = callbacks.get(payload.type);

	if (callback) {
		return await callback({
			payload,
			wasmModule: wasmModule!,
			downloadTracker
		});
	}

	return Promise.reject(new Error('Worker Callback not found'));
}
