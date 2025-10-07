export enum Geant4WorkerMessageType {
	INIT_DATA_FILES,
	INIT_LAZY_FILES,
	CREATE_FILE,
	READ_FILE,
	RUN_SIMULATION,
	POLL_DATASET_PROGRESS,
	PROGRESS,
	ERROR
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
	data: Geant4WorkerMessagePayload;
};

export type Geant4WorkerPromise = {
	idx: number;
	message: Geant4WorkerMessage;
};
