export enum Geant4WorkerReceiveMessageType {
	INIT_DATA_FILES,
	INIT_LAZY_FILES,
	CREATE_FILE,
	READ_FILE,
	RUN_SIMULATION,
	POLL_DATASET_PROGRESS
}

export enum Geant4WorkerSendMessageType {
	WASM_INITIALIZED,
	PRINT_ERROR,
	PRINT,
	DOWNLOAD_STATUS,
	CREATE_FILE_ACK,
	FILE_CONTENT,
	POLL_DATASET_PROGRESS,
	PROGRESS,
	DEPS_LOADED,
	RESULT,
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

export type Geant4WorkerMessage<T = Geant4WorkerReceiveMessageType | Geant4WorkerSendMessageType> =
	{
		idx?: number;
		type: T;
		data?: Geant4WorkerMessageFile | Geant4WorkerDatasetProgress | string | number | Error;
	};
