export enum Geant4WorkerMessageType {
	INIT_WASM_MODULE,
	INIT_DATA_FILES,
	INIT_LAZY_FILES,
	CREATE_FILE,
	READ_FILE,
	SIMULATION,
	POLL_DATASET_PROGRESS,

	ERROR,
	PRINT,
	PRINT_ERROR,
	PROGRESS,
	DOWNLOAD_STATUS
}

export type Geant4WorkerMessageFile = {
	name: string;
	data: string;
};

export type Geant4WorkerDatasetProgress = {
	stage: 'downloading' | 'preparing' | 'done';
	progress: number;
};

export type Geant4WorkerMessageDatasetProgress = Record<string, Geant4WorkerDatasetProgress>;

export type Geant4WorkerMessagePayload =
	| Geant4WorkerMessageFile
	| Geant4WorkerMessageDatasetProgress
	| string
	| number
	| Error
	| void;

export type Geant4WorkerMessage = {
	type: Geant4WorkerMessageType;
	data?: Geant4WorkerMessagePayload;
};

export type Geant4WorkerPromise = {
	idx?: number;
	message: Geant4WorkerMessage;
};

///////////////////////// MOVE TO ENV IN FUTURE ////////////////////////////
export const S3_JSON_FILES = [
	'load_G4EMLOW8.6.1.json',
	'load_G4ENSDFSTATE3.0.json',
	'load_G4NDL4.7.1.json',
	'load_G4PARTICLEXS4.1.json',
	'load_G4SAIDDATA2.0.json',
	'load_PhotonEvaporation6.1.json'
];

export const S3_PREFIX_MAP: Record<string, string> = {
	'.wasm': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/',
	'.data': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/',
	'.metadata': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/datafiles/',
	'.json': 'https://s3p.cloud.cyfronet.pl/geant4-wasm/lazy_files_metadata/'
};
