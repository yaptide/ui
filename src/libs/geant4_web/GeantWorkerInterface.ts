
export enum GeantWorkerMessageType {
    INIT_DATA_FILES,
    INIT_LAZY_FILES,
    CREATE_FILE,
    READ_FILE,
    RUN_SIMULATION,
    FILE_RESPONSE
}

export type GeantWorkerMessageFile = {
    name: string,
    data: string 
}

export type GeantWorkerMessage = {
    type: GeantWorkerMessageType,
    data: GeantWorkerMessageFile | string
}