/**
 * Geant4 Worker
 */

import createMainModule from '../libs/geant-web-stubs/geant4_wasm';
import { default as initG4EMLOW } from '../libs/geant-web-stubs/preload/preload_G4EMLOW8.6.1';
import { default as initG4ENSDFSTATE } from '../libs/geant-web-stubs/preload/preload_G4ENSDFSTATE3.0';
import { default as initG4NDL } from '../libs/geant-web-stubs/preload/preload_G4NDL4.7.1';
import { default as initG4PARTICLEXS } from '../libs/geant-web-stubs/preload/preload_G4PARTICLEXS4.1';
import { default as initG4SAIDDATA } from '../libs/geant-web-stubs/preload/preload_G4SAIDDATA2.0';
import { default as initPhotoEvaporation } from '../libs/geant-web-stubs/preload/preload_PhotonEvaporation6.1';
import { workerPostMessage, workerSetOnMessage } from './Geant4WorkerHelpers';
import {
	Geant4WorkerDownloadProgressMonitor,
	Geant4WorkerPreModule} from './Geant4WorkerPreModule';
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

// Files passed in from UI
// A .gdml file and a .mac file is required to run the simulation
let includedFiles: string[] = [];

const downloadTracker = new Geant4WorkerDownloadProgressMonitor();

const mod = createMainModule(new Geant4WorkerPreModule(downloadTracker, S3_PREFIX_MAP));

const onMessageFunction = async (
	event: MessageEvent<Geant4WorkerMessage<Geant4WorkerReceiveMessageType>>
) => {
	switch (event.data.type) {
		case Geant4WorkerReceiveMessageType.INIT_DATA_FILES: {
			// Download the whole dataset at once (roughly 2GB of data).
			// After each of 6 datasets is processed, it should be cached
			// and other workers should be able to access the data without downloading again.
			// This, in theory, could enable the app to run offline.
			await mod.then(async module => {
				try {
					downloadTracker.setCurrentDataset('G4EMLOW8.6.1');
					await initG4ENSDFSTATE(module);
					await initG4EMLOW(module);
					await initG4NDL(module);
					await initG4PARTICLEXS(module);
					await initG4SAIDDATA(module);
					await initPhotoEvaporation(module);

					workerPostMessage({
						type: Geant4WorkerSendMessageType.DEPS_LOADED
					});
				} catch (error: unknown) {
					console.error('Error initializing lazy files:', (error as Error).message);
				}
			});

			break;
		}

		case Geant4WorkerReceiveMessageType.INIT_LAZY_FILES: {
			// Initialize lazy download. Files needed for specific simulation are downloaded on-demand.
			// Best-case scenario - the download size is reduced to a couple of kb.
			await mod.then(async module => {
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
									module.FS_createLazyFile(
										file.parent,
										file.name,
										file.url,
										true,
										true
									);
								} else if (file.type === 'path') {
									module.FS_createPath(file.parent, file.name, true, true);
								}
							}

							workerPostMessage({
								type: Geant4WorkerSendMessageType.DEPS_LOADED
							});
						});
				}
			});

			break;
		}

		case Geant4WorkerReceiveMessageType.CREATE_FILE:
			await mod.then(module => {
				const data = event.data.data as Geant4WorkerMessageFile;

				module.FS.createFile('/', data.name, null, true, true);
				module.FS.writeFile(data.name, data.data);
				includedFiles.push(data.name);
			});

			workerPostMessage({
				type: Geant4WorkerSendMessageType.CREATE_FILE_ACK,
				idx: event.data.idx
			});

			break;
		case Geant4WorkerReceiveMessageType.READ_FILE:
			await mod.then(module => {
				const fileName = event.data.data as string;

				// 'as unknown as string' because TS doesn't know that when encoding is utf8, a string is returned
				const fileContent = module.FS.readFile(fileName, {
					encoding: 'utf8'
				}) as unknown as string;

				workerPostMessage({
					type: Geant4WorkerSendMessageType.FILE_CONTENT,
					data: {
						name: fileName,
						data: fileContent
					} as Geant4WorkerMessageFile,
					idx: event.data.idx
				});
			});

			break;
		case Geant4WorkerReceiveMessageType.RUN_SIMULATION:
			const geometryDefinition = includedFiles.find(k => k.endsWith('.gdml'));
			const macroFile = includedFiles.find(k => k.endsWith('.mac'));

			if (!geometryDefinition || !macroFile) {
				throw new Error('.gdml and .mac file are required');
			}

			try {
				console.log('Starting Geant4 simulation...');
				const result = await mod.then(module => {
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

				workerPostMessage({
					type: Geant4WorkerSendMessageType.RESULT,
					data: result
				});
			} catch (error: unknown) {
				workerPostMessage({
					idx: event.data.idx,
					type: Geant4WorkerSendMessageType.ERROR,
					data: error as Error
				});
			}

			break;

		case Geant4WorkerReceiveMessageType.POLL_DATASET_PROGRESS: {
			// const progress = downloadTracker.getOverallProgress();

			// workerPostMessage({
			// 	type: Geant4WorkerSendMessageType.POLL_DATASET_PROGRESS,
			// 	data: progress,
			// 	idx: event.data.idx
			// });

			break;
		}

		default:
			console.error('Unknown message type:', event.data.type);
	}
};

workerSetOnMessage(onMessageFunction);
