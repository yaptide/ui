export interface IResponse {
    message?: string;
    status?: string;
    content?: unknown;
}

export interface IResponseMsg extends IResponse {
    message: string;
}