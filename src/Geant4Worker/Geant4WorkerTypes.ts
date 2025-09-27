export enum Geant4WorkerMessageType {
	INIT_DATA_FILES,
	INIT_LAZY_FILES,
	CREATE_FILE,
	READ_FILE,
	RUN_SIMULATION,
	FILE_RESPONSE
}

export type Geant4WorkerMessageFile = {
	name: string;
	data: string;
};

export type Geant4WorkerMessage = {
	idx?: number;
	type: Geant4WorkerMessageType;
	data: Geant4WorkerMessageFile | string;
};
