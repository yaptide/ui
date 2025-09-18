/**
 * Geant4 Worker
 *
 * Additional credits:
 * - https://github.com/ostatni5
 * - https://github.com/lkwinta
 */

import createMainModule from '../libs/geant-web-stubs/geant4_wasm';
import { default as initG4EMLOW } from '../libs/geant-web-stubs/preload/preload_G4EMLOW8.6.1';
import { default as initG4ENSDFSTATE } from '../libs/geant-web-stubs/preload/preload_G4ENSDFSTATE3.0';
import { default as initG4NDL } from '../libs/geant-web-stubs/preload/preload_G4NDL4.7.1';
import { default as initG4PARTICLEXS } from '../libs/geant-web-stubs/preload/preload_G4PARTICLEXS4.1';
import { default as initG4SAIDDATA } from '../libs/geant-web-stubs/preload/preload_G4SAIDDATA2.0';
import { default as initPhotoEvaporation } from '../libs/geant-web-stubs/preload/preload_PhotonEvaporation6.1';

const S3_PREFIX_MAP: Record<string, string> = {
	'.wasm': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/',
	'.data': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/',
	'.metadata': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/',
	'.json': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/lazy_files_metadata/'
};

// TypeScript type assertion to treat self as a Worker
const ctx = self as unknown as Worker; // eslint-disable-line no-restricted-globals

const WORKER_ID = Math.round(Math.random() * 90000 + 10000).toString(16);
const LOG_PREFIX = `[Geant4 worker ${WORKER_ID}]`;

function debugLog(...args: any[]) {
	console.log(LOG_PREFIX, ...args);
}

function debugErr(...args: any[]) {
	console.error(LOG_PREFIX, ...args);
}

// Files passed in from UI
// A .gdml file and a .mac file is required to run the simulation
let filesToInclude: { [k: string]: string } = {};

const preModule = {
	preRun: [],
	postRun: [],
	onRuntimeInitialized: function () {
		postMessage({ type: 'init', data: 'onRuntimeInitialized' });
	},
	printErr: (function () {
		return function (text: string) {
			console.error(LOG_PREFIX, ...Array.prototype.slice.call(arguments));
		};
	})(),
	print: (function () {
		return function (text: any) {
			const data = [LOG_PREFIX, ...Array.prototype.slice.call(arguments)].join('');
			postMessage({ type: 'print', data });
		};
	})(),
	last: {
		time: Date.now(),
		text: ''
	},
	setStatus: function (text: string) {
		if (!preModule.last) preModule.last = { time: Date.now(), text: '' };
		if (text === preModule.last.text) return;
		var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
		var now = Date.now();

		if (m && now - preModule.last.time < 30) return; // if this is a progress update, skip it if too soon
		preModule.last.time = now;
		preModule.last.text = text;
		postMessage({ type: 'status', data: text });
	},
	totalDependencies: 0,
	monitorRunDependencies: function (left: any) {
		this.totalDependencies = Math.max(this.totalDependencies, left);
		preModule.setStatus(
			left
				? 'Preparing... (' +
						(this.totalDependencies - left) +
						'/' +
						this.totalDependencies +
						')'
				: 'All downloads complete.'
		);
	},
	locateFile: function (path: any, prefix: any) {
		// if it's a mem init file, use a custom dir
		const ext = path.slice(path.lastIndexOf('.'));

		if (ext in S3_PREFIX_MAP) {
			return S3_PREFIX_MAP[ext] + path;
		}

		// otherwise, use the default, the prefix (JS file's dir) + the path
		return prefix + path;
	}
};

const mod = createMainModule(preModule);
mod.then(module => {
	debugLog('Performing sanity checks...');

	const tClass = new module.TestClass(1, 2);

	debugLog(tClass.testMethod());
	const vec = new module.vector_int();
	vec.push_back(1);
	vec.push_back(2);
	vec.push_back(3);

	debugLog(tClass.complicatedFunction(vec));
});

ctx.onmessage = async (event: MessageEvent) => {
	switch (event.data.type) {
		case 'loadDepsData': {
			// Download the whole dataset at once (roughly 2GB of data).
			// After each of 6 datasets is processed, it should be cached
			// and other workers should be able to access the data without downloading again.
			// This, in theory, could enable the app to run offline.
			await mod.then(async module => {
				debugLog('Initializing lazy files...');

				try {
					await initG4ENSDFSTATE(module);
					await initG4EMLOW(module);
					await initG4NDL(module);
					await initG4PARTICLEXS(module);
					await initG4SAIDDATA(module);
					await initPhotoEvaporation(module);
				} catch (error: unknown) {
					debugErr('Error initializing lazy files:', (error as Error).message);
				}

				debugLog('Lazy files initialized.');
			});

			ctx.postMessage({
				type: 'status',
				data: 'DEPS OK'
			});

			break;
		}

		case 'loadDepsLazy': {
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
						});
					debugLog(`Loaded lazy files from ${jsonFile}`);
				}

				ctx.postMessage({
					type: 'status',
					data: 'DEPS OK'
				});
			});

			break;
		}

		case 'includeFile':
			if (!event.data.hasOwnProperty('fileName') || !event.data.hasOwnProperty('content')) {
				throw new Error('Properties "fileName" and "content" are required');
			}

			filesToInclude[event.data.fileName] = event.data.content;

			break;
		case 'runSimulation':
			const geometryDefinition = Object.keys(filesToInclude).find(k => k.endsWith('.gdml'));
			const macroFile = Object.keys(filesToInclude).find(k => k.endsWith('.mac'));

			if (!geometryDefinition || !macroFile) {
				throw new Error('.gdml and .mac file are required');
			}

			try {
				debugLog('Starting Geant4 simulation...');
				const runResults = await mod.then(module => {
					module.FS.createFile('/', 'geom.gdml', null, true, true);
					module.FS.createFile('/', 'init.mac', null, true, true);

					module.FS.writeFile('geom.gdml', filesToInclude[geometryDefinition]);
					module.FS.writeFile('init.mac', filesToInclude[macroFile]);

					return module.Geant4_GDML();
				});

				debugLog('Run results:', runResults);

				// TODO: Fetch the files (we need actual filenames on the FS for that)
				// const result_data = await mod.then((module) => {
				// 	return module.FS.readFile("cylz_fluence.txt", { encoding: "utf8" });
				// });
			} catch (error: unknown) {
				ctx.postMessage({
					type: 'error',
					message: (error as Error).message,
					error: error
				});
			}

			break;
		default:
			debugErr('Unknown message type:', event.data.type);
	}
};
